import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { criarOrcamentoSchema } from "@/lib/validation/orcamentos";
import { createCalendarEvent, refreshAccessToken } from "@/lib/google/calendar";
import { logAudit } from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

const TZ = "America/Sao_Paulo";
const OFFSET = "-03:00";

// Soma 1h ao (dia, horario) preservando rollover de dia. Usa UTC apenas para a
// aritmética de calendário (sem efeito de fuso local).
function maisUmaHora(dia: string, horario: string) {
  const [y, mo, d] = dia.split("-").map(Number);
  const [h, mi] = horario.split(":").map(Number);
  const base = new Date(Date.UTC(y, mo - 1, d, h, mi, 0));
  base.setUTCHours(base.getUTCHours() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    dia: `${base.getUTCFullYear()}-${pad(base.getUTCMonth() + 1)}-${pad(base.getUTCDate())}`,
    horario: `${pad(base.getUTCHours())}:${pad(base.getUTCMinutes())}`,
  };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, empresa_id, papel")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.empresa_id) {
    return NextResponse.json(
      { message: "Perfil sem empresa vinculada." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Corpo da requisição inválido (JSON malformado)." },
      { status: 400 },
    );
  }
  const parsed = criarOrcamentoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 422 },
    );
  }
  const input = parsed.data;

  // Vendedor: default = autor; só admin/gestor pode atribuir a outro.
  let vendedorId = profile.id as string;
  if (
    input.vendedor_id &&
    input.vendedor_id !== profile.id &&
    ["admin", "gestor"].includes(profile.papel as string)
  ) {
    const { data: vend } = await supabase
      .from("profiles")
      .select("id, empresa_id, papel, ativo")
      .eq("id", input.vendedor_id)
      .maybeSingle();
    if (
      !vend ||
      vend.empresa_id !== profile.empresa_id ||
      !["admin", "gestor", "vendedor"].includes(vend.papel as string) ||
      !vend.ativo
    ) {
      return NextResponse.json(
        { message: "Vendedor inválido." },
        { status: 422 },
      );
    }
    vendedorId = vend.id as string;
  }

  // Resolve cliente: encontra por telefone (mesma empresa) ou cria inline.
  const telefoneLimpo = input.telefone.replace(/\D/g, "");
  let clienteId: string | null = null;
  let clienteCriadoNovo = false;

  if (telefoneLimpo.length >= 10) {
    const { data: candidatos } = await supabase
      .from("clientes")
      .select("id, telefone")
      .eq("empresa_id", profile.empresa_id)
      .not("telefone", "is", null);
    const match = (candidatos ?? []).find((c) => {
      const armazenado = (c.telefone ?? "").replace(/\D/g, "");
      if (!armazenado) return false;
      if (armazenado === telefoneLimpo) return true;
      if (armazenado.length >= 11 && telefoneLimpo.length >= 11) {
        return armazenado.slice(-11) === telefoneLimpo.slice(-11);
      }
      return false;
    });
    if (match?.id) clienteId = match.id as string;
  }

  if (!clienteId) {
    const { data: novoCliente, error: clienteErr } = await supabase
      .from("clientes")
      .insert({
        empresa_id: profile.empresa_id,
        nome: input.cliente_nome.trim(),
        telefone: input.telefone.trim(),
        endereco: input.endereco ? { texto: input.endereco } : null,
        origem: "orcamento",
      })
      .select("id")
      .single();
    if (clienteErr || !novoCliente) {
      return NextResponse.json(
        { message: clienteErr?.message ?? "Falha ao cadastrar cliente." },
        { status: 500 },
      );
    }
    clienteId = novoCliente.id as string;
    clienteCriadoNovo = true;
  }

  // Cria a venda tipo "orcamento" (sem produção; valores zerados, detalha depois).
  const hoje = new Date().toISOString().slice(0, 10);
  const { data: venda, error: vendaError } = await supabase
    .from("vendas")
    .insert({
      empresa_id: profile.empresa_id,
      cliente_id: clienteId,
      vendedor_id: vendedorId,
      tipo: "orcamento",
      status: "aguardando_producao",
      valor_total: 0,
      desconto: 0,
      taxa: 0,
      parcelas: 1,
      data_venda: hoje,
      data_prevista_entrega: input.dia,
      observacoes: input.observacoes?.trim() || null,
    })
    .select("id, numero")
    .single();

  if (vendaError || !venda) {
    if (clienteCriadoNovo) {
      await supabase.from("clientes").delete().eq("id", clienteId);
    }
    return NextResponse.json(
      { message: vendaError?.message ?? "Falha ao registrar orçamento." },
      { status: 500 },
    );
  }

  // Item placeholder (o schema de venda exige ao menos um item; detalhado depois).
  await supabase.from("venda_itens").insert({
    venda_id: venda.id,
    produto_descricao: "Orçamento (visita)",
    quantidade: 1,
    valor_unitario: 0,
  });

  // Evento de agenda da visita, atribuído ao vendedor.
  const inicio = `${input.dia}T${input.horario}:00${OFFSET}`;
  const f = maisUmaHora(input.dia, input.horario);
  const fim = `${f.dia}T${f.horario}:00${OFFSET}`;
  const titulo = `Orçamento #${venda.numero} — ${input.cliente_nome.trim()}`;

  const { data: evento } = await supabase
    .from("agenda_eventos")
    .insert({
      empresa_id: profile.empresa_id,
      venda_id: venda.id,
      usuario_id: vendedorId,
      titulo,
      inicio,
      fim,
      status_sync: "pendente",
    })
    .select("id")
    .single();

  // Tenta sincronizar com o Google Agenda do VENDEDOR (best-effort).
  // agendaStatus: "sincronizado" | "pendente" (sem Google) | "erro".
  let agendaStatus: "sincronizado" | "pendente" | "erro" = "pendente";
  let googleConectado = false;

  const { data: token } = await supabase
    .from("google_calendar_tokens")
    .select("*")
    .eq("usuario_id", vendedorId)
    .maybeSingle();

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (token && clientId && clientSecret && evento?.id) {
    googleConectado = true;
    try {
      let accessToken = token.access_token as string | null;
      const expiresAt = token.expires_at
        ? new Date(token.expires_at as string)
        : null;
      const precisaRenovar =
        !accessToken ||
        !expiresAt ||
        expiresAt.getTime() - Date.now() < 5 * 60_000;
      if (precisaRenovar) {
        const refreshed = await refreshAccessToken({
          refreshToken: token.refresh_token as string,
          clientId,
          clientSecret,
        });
        accessToken = refreshed.access_token;
        await supabase
          .from("google_calendar_tokens")
          .update({
            access_token: refreshed.access_token,
            expires_at: new Date(
              Date.now() + refreshed.expires_in * 1000,
            ).toISOString(),
          })
          .eq("usuario_id", vendedorId);
      }

      const partes = [
        `Cliente: ${input.cliente_nome.trim()}`,
        `Telefone: ${input.telefone.trim()}`,
        input.endereco ? `Endereço: ${input.endereco}` : null,
        input.observacoes ? `Obs: ${input.observacoes.trim()}` : null,
      ].filter(Boolean);

      const event = await createCalendarEvent({
        accessToken: accessToken!,
        calendarId: (token.calendar_id as string | null) ?? "primary",
        event: {
          summary: titulo,
          description: partes.join("\n"),
          start: { dateTime: inicio, timeZone: TZ },
          end: { dateTime: fim, timeZone: TZ },
        },
      });

      await supabase
        .from("agenda_eventos")
        .update({ google_event_id: event.id, status_sync: "sincronizado" })
        .eq("id", evento.id);
      agendaStatus = "sincronizado";
    } catch (err) {
      await supabase
        .from("agenda_eventos")
        .update({
          status_sync: "erro",
          ultimo_erro:
            err instanceof Error ? err.message : "erro desconhecido",
        })
        .eq("id", evento.id);
      agendaStatus = "erro";
    }
  }

  // Notifica o vendedor (best-effort, não falha o orçamento se a RLS barrar).
  try {
    await supabase.from("notificacoes").insert({
      usuario_id: vendedorId,
      empresa_id: profile.empresa_id,
      tipo: "orcamento_criado",
      titulo: "Novo orçamento agendado",
      mensagem: `${titulo} em ${input.dia} às ${input.horario}.`,
      link: `/vendas/${venda.id}`,
      prioridade: "alta",
    });
  } catch {
    // ignora: notificação é complementar ao evento da agenda
  }

  await logAudit({
    modulo: "vendas",
    acao: "create_orcamento",
    entidade: "vendas",
    entidadeId: venda.id,
    dadosDepois: {
      numero: venda.numero,
      vendedor_id: vendedorId,
      inicio,
      agenda_status: agendaStatus,
    },
  });

  return NextResponse.json({
    id: venda.id,
    numero: venda.numero,
    agenda_status: agendaStatus,
    google_conectado: googleConectado,
  });
}

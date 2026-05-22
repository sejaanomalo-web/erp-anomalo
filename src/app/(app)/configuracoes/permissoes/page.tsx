"use client";

import { useEffect, useState } from "react";
import { Save, Users } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { toast } from "@/components/feedback/Toast";
import {
  useVendedoresAdmin,
  useAtualizarPermissoes,
  type VendedorListRow,
} from "@/lib/queries/vendedoresAdmin";
import {
  MODULOS_LISTAVEIS,
  resolveMatrix,
  type Modulo,
} from "@/lib/permissions/matrix";
import { initials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface ProfileComExtras extends VendedorListRow {
  permissoes_extras: { modulos_extras?: string[] } | null;
}

export default function PermissoesPage() {
  const vendedores = useVendedoresAdmin();
  const salvar = useAtualizarPermissoes();
  const [extrasState, setExtrasState] = useState<Record<string, string[]>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [completo, setCompleto] = useState<ProfileComExtras[]>([]);

  // Carrega permissoes_extras completo (a query de vendedores omite o jsonb)
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles")
      .select(
        "id, nome, email, telefone, cargo, papel, ativo, avatar_url, created_at, permissoes_extras",
      )
      .in("papel", ["vendedor", "gestor", "admin", "financeiro", "producao"])
      .order("nome", { ascending: true })
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as ProfileComExtras[];
        setCompleto(rows);
        const initial: Record<string, string[]> = {};
        for (const r of rows) {
          initial[r.id] = r.permissoes_extras?.modulos_extras ?? [];
        }
        setExtrasState(initial);
      });
  }, [vendedores.data?.length]);

  function toggle(usuarioId: string, modulo: Modulo, papelBase: string) {
    setExtrasState((prev) => {
      const atual = new Set(prev[usuarioId] ?? []);
      if (atual.has(modulo)) atual.delete(modulo);
      else atual.add(modulo);
      return { ...prev, [usuarioId]: Array.from(atual) };
    });
    setDirty((prev) => new Set(prev).add(usuarioId));
    // papelBase é informativo, evita warning
    void papelBase;
  }

  async function salvarUsuario(usuarioId: string) {
    try {
      await salvar.mutateAsync({
        usuario_id: usuarioId,
        modulos_extras: extrasState[usuarioId] ?? [],
        acoes_extras: {},
      });
      toast.success("Permissões atualizadas.");
      setDirty((prev) => {
        const next = new Set(prev);
        next.delete(usuarioId);
        return next;
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar.");
    }
  }

  if (vendedores.isLoading || completo.length === 0) {
    return (
      <div className="flex flex-col gap-2xl">
        <Hero
          eyebrow="Sistema"
          titulo="Permissões"
          descricao="Sobreponha acessos extras por usuário, sem mexer no papel base."
        />
        <LoadingState linhas={4} />
      </div>
    );
  }

  if (completo.length === 0) {
    return (
      <EmptyState
        icone={Users}
        titulo="Sem usuários cadastrados."
        descricao="Convide pessoas em Vendedores para definir permissões aqui."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Sistema"
        titulo="Permissões"
        descricao="Cada usuário tem um papel base. Marque módulos extras para ampliar o acesso (acrescenta, nunca remove)."
      />

      <div className="flex flex-col gap-md">
        {completo.map((usuario) => {
          const extras = extrasState[usuario.id] ?? [];
          const matrix = resolveMatrix(usuario.papel, {
            modulos_extras: extras,
          });
          const userDirty = dirty.has(usuario.id);
          return (
            <Card key={usuario.id} className="p-lg flex flex-col gap-md">
              <div className="flex items-center justify-between gap-md flex-wrap">
                <div className="flex items-center gap-md">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials(usuario.nome)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-xxs">
                    <span className="text-body-md text-text-1">
                      {usuario.nome}
                    </span>
                    <span className="text-body-sm text-text-3">
                      {usuario.email}
                    </span>
                  </div>
                  <Badge tone="accent">{usuario.papel}</Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => salvarUsuario(usuario.id)}
                  disabled={!userDirty || salvar.isPending}
                >
                  <Save size={14} strokeWidth={1.8} />
                  {userDirty ? "Salvar" : "Salvo"}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-sm">
                {MODULOS_LISTAVEIS.map((m) => {
                  const base = matrix[m.id] ?? {};
                  const temBase = Object.values(base).some(
                    (v) => v === true || v === "self",
                  );
                  const isExtra = extras.includes(m.id);
                  const baseSemExtra = !isExtra && temBase;
                  return (
                    <label
                      key={m.id}
                      htmlFor={`${usuario.id}-${m.id}`}
                      className="flex items-center gap-sm py-xs cursor-pointer"
                    >
                      <Checkbox
                        id={`${usuario.id}-${m.id}`}
                        checked={temBase}
                        disabled={baseSemExtra}
                        onCheckedChange={() =>
                          toggle(usuario.id, m.id, usuario.papel)
                        }
                      />
                      <span
                        className={`text-body-md ${baseSemExtra ? "text-text-3" : "text-text-1"}`}
                      >
                        {m.label}
                      </span>
                      {baseSemExtra ? (
                        <span className="text-caption text-text-4">
                          (papel)
                        </span>
                      ) : isExtra ? (
                        <span className="text-caption text-accent">
                          extra
                        </span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-caption text-text-4">
        Caixas marcadas em cinza são herdadas do papel base e não podem ser
        desmarcadas aqui. Para reduzir acesso, mude o papel do usuário em
        Vendedores.
      </p>
    </div>
  );
}

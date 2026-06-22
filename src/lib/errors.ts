/**
 * Extrai uma mensagem legível de erros vindos do Supabase/PostgREST.
 *
 * Por que isto existe: os erros do supabase-js (PostgrestError) são objetos
 * planos `{ message, code, details, hint }`, NÃO instâncias de `Error`. Catches
 * que fazem `err instanceof Error ? err.message : "Falha..."` caem sempre no
 * fallback genérico e escondem a causa real (coluna inexistente, violação de
 * RLS, chave duplicada). Era exatamente o caso do financeiro: o usuário só via
 * "Falha ao salvar" e nunca o motivo.
 */

type ErroSupabase = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function extrairMensagem(err: unknown): string | null {
  if (!err) return null;
  if (typeof err === "string") return err.trim() || null;
  if (err instanceof Error) return err.message || null;
  if (typeof err === "object") {
    const e = err as ErroSupabase;
    return (e.message || e.details || e.hint || null)?.trim() || null;
  }
  return null;
}

/**
 * Devolve uma mensagem amigável (PT-BR) a partir de qualquer erro, preservando
 * a causa técnica quando útil e mapeando os casos mais comuns para algo
 * acionável pelo usuário.
 */
export function mensagemErroSupabase(
  err: unknown,
  fallback = "Não foi possível concluir a ação. Tente novamente.",
): string {
  const raw = extrairMensagem(err);
  if (!raw) return fallback;
  const lower = raw.toLowerCase();

  // Schema desatualizado: coluna/tabela/relacionamento ausente. Típico de
  // migração não aplicada (ex.: a 018 do financeiro — contas/recorrentes).
  if (
    lower.includes("does not exist") ||
    lower.includes("schema cache") ||
    lower.includes("could not find") ||
    (lower.includes("relation") && lower.includes("exist"))
  ) {
    return `Banco de dados desatualizado (${raw}). É preciso aplicar a migração pendente do financeiro.`;
  }

  // RLS: usuário sem o papel necessário.
  if (lower.includes("row-level security") || lower.includes("row level security")) {
    return "Sem permissão para esta ação. O usuário precisa ter papel admin, gestor ou financeiro.";
  }

  // Violação de unicidade.
  if (lower.includes("duplicate key") || lower.includes("already exists")) {
    return "Já existe um registro com esses dados.";
  }

  // Violação de NOT NULL / campo obrigatório.
  if (lower.includes("null value") && lower.includes("not-null")) {
    return "Há um campo obrigatório não preenchido.";
  }

  // Sessão expirada / não autenticado.
  if (lower.includes("jwt") || lower.includes("not authenticated")) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }

  return raw;
}

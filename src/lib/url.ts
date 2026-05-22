import type { NextRequest } from "next/server";

/**
 * Resolve a URL base correta para callbacks e magic links.
 *
 * Ordem de prioridade:
 *   1. NEXT_PUBLIC_APP_URL (manual override, útil para domínio custom)
 *   2. x-forwarded-host header (Vercel coloca aqui, com scheme em x-forwarded-proto)
 *   3. host header (fallback)
 *
 * Evita gerar redirects para localhost em produção quando o env var não está setado.
 */
export function resolveAppUrl(request: NextRequest): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    const proto = forwardedProto ?? "https";
    return `${proto}://${forwardedHost}`;
  }

  const host = request.headers.get("host");
  if (host) {
    const proto = host.startsWith("localhost") ? "http" : "https";
    return `${proto}://${host}`;
  }

  // último fallback para chamadas vindas de scripts sem headers (test)
  return new URL(request.url).origin;
}

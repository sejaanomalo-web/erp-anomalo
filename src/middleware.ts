import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { updateSession } from "@/lib/supabase/middleware";

// Rotas /api/* que NÃO devem ser rate-limited (health checks e OAuth callback).
const ROTAS_EXCLUIDAS = new Set<string>([
  "/api/health",
  "/api/health/db",
  "/api/google/oauth/callback",
]);

// Lazy: só instancia o Ratelimit se as env vars existirem.
let ratelimit: Ratelimit | null = null;
let avisoEmitido = false;

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (!avisoEmitido) {
      console.warn(
        "[ratelimit] UPSTASH_REDIS_REST_URL/TOKEN ausentes — rate limiting desativado (fail-open).",
      );
      avisoEmitido = true;
    }
    return null;
  }

  const redis = new Redis({ url, token });
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "10 s"),
    prefix: "ratelimit:api",
  });
  return ratelimit;
}

function getClientIp(request: NextRequest): string {
  // Em produção atrás da Vercel, x-forwarded-for é a fonte confiável.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "127.0.0.1";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit apenas em /api/*, com exceções explícitas.
  if (pathname.startsWith("/api/") && !ROTAS_EXCLUIDAS.has(pathname)) {
    const rl = getRatelimit();
    if (rl) {
      const ip = getClientIp(request);
      const { success } = await rl.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429 },
        );
      }
    }
  }

  // updateSession do Supabase continua rodando em todas as rotas.
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

const schema = z.object({
  modulo: z.string(),
  acao: z.string(),
  entidade: z.string(),
  entidadeId: z.string().uuid().optional(),
  dadosAntes: z.unknown().optional(),
  dadosDepois: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await logAudit({
    ...parsed.data,
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0] ??
      request.headers.get("x-real-ip") ??
      undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
    dadosAntes: parsed.data.dadosAntes as Parameters<typeof logAudit>[0]["dadosAntes"],
    dadosDepois: parsed.data.dadosDepois as Parameters<typeof logAudit>[0]["dadosDepois"],
  });
  return NextResponse.json({ ok: true });
}

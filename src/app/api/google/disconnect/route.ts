import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  await supabase
    .from("google_calendar_tokens")
    .delete()
    .eq("usuario_id", user.id);

  await logAudit({
    modulo: "agenda",
    acao: "google_disconnect",
    entidade: "google_calendar_tokens",
    entidadeId: user.id,
  });

  return NextResponse.json({ ok: true });
}

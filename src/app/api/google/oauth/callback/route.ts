import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens } from "@/lib/google/calendar";
import { logAudit } from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const cookieState = request.cookies.get("google_oauth_state")?.value;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (!code) {
    return NextResponse.redirect(`${appUrl}/agenda?error=missing_code`);
  }
  if (!stateParam || stateParam !== cookieState) {
    return NextResponse.redirect(`${appUrl}/agenda?error=state_mismatch`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/agenda?error=missing_credentials`);
  }

  const redirectUri = `${appUrl}/api/google/oauth/callback`;

  try {
    const tokens = await exchangeCodeForTokens({
      code,
      clientId,
      clientSecret,
      redirectUri,
    });

    const { data: profile } = await supabase
      .from("profiles")
      .select("empresa_id")
      .eq("id", user.id)
      .maybeSingle();

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)
      .toISOString();

    await supabase.from("google_calendar_tokens").upsert(
      {
        usuario_id: user.id,
        empresa_id: profile?.empresa_id ?? null,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        scope: tokens.scope,
      },
      { onConflict: "usuario_id" },
    );

    await logAudit({
      modulo: "agenda",
      acao: "google_connect",
      entidade: "google_calendar_tokens",
      entidadeId: user.id,
    });

    const response = NextResponse.redirect(`${appUrl}/agenda?connected=1`);
    response.cookies.delete("google_oauth_state");
    return response;
  } catch (err) {
    const message =
      err instanceof Error ? encodeURIComponent(err.message) : "unknown";
    return NextResponse.redirect(`${appUrl}/agenda?error=${message}`);
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { buildAuthUrl } from "@/lib/google/calendar";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", _request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      {
        message:
          "GOOGLE_CLIENT_ID não configurado. Adicione as credenciais OAuth na Vercel.",
      },
      { status: 500 },
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(_request.url).origin;
  const redirectUri = `${appUrl}/api/google/oauth/callback`;
  const state = nanoid(24);

  const response = NextResponse.redirect(
    buildAuthUrl({ clientId, redirectUri, state }),
  );
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
  return response;
}

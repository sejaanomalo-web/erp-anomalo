import { createBrowserClient } from "@supabase/ssr";

// Os tipos gerados pelo Supabase (`supabase gen types`) serão plugados aqui
// como genérico assim que o projeto dedicado for criado. Por enquanto, usamos
// o client não-tipado para evitar conflitos com o stub manual.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
}

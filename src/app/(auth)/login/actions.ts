"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  senha: z.string().min(6, "Senha precisa ter ao menos 6 caracteres."),
  redirect: z.string().optional(),
});

export interface LoginActionState {
  error?: string;
  ok?: boolean;
}

export async function loginAction(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
    redirect: formData.get("redirect") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.senha,
  });

  if (error) {
    return { error: "Credenciais inválidas." };
  }

  revalidatePath("/", "layout");
  redirect(parsed.data.redirect && parsed.data.redirect.startsWith("/") ? parsed.data.redirect : "/");
}

const magicLinkSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
});

export async function magicLinkAction(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = magicLinkSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "E-mail inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/`,
    },
  });

  if (error) {
    return { error: "Não foi possível enviar o link." };
  }

  return { ok: true };
}

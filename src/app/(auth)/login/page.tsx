"use client";

import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoldDivider } from "@/components/brand/GoldDivider";
import { Eyebrow } from "@/components/brand/Eyebrow";
import { loginAction, magicLinkAction, type LoginActionState } from "./actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const [mode, setMode] = useState<"senha" | "magic">("senha");
  const initial: LoginActionState = {};
  const [stateSenha, actionSenha, pendingSenha] = useActionState(loginAction, initial);
  const [stateMagic, actionMagic, pendingMagic] = useActionState(magicLinkAction, initial);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <Eyebrow>Acesso</Eyebrow>
        <h1 className="text-h1 text-text-1">Entrar</h1>
        <GoldDivider className="mt-xs" />
      </div>

      {mode === "senha" ? (
        <form action={actionSenha} className="flex flex-col gap-md">
          <input type="hidden" name="redirect" value={redirect} />
          <div className="flex flex-col gap-xs">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="voce@empresa.com"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              name="senha"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          {stateSenha.error ? (
            <p className="text-body-sm text-error">{stateSenha.error}</p>
          ) : null}
          <Button type="submit" disabled={pendingSenha} className="w-full">
            {pendingSenha ? "Entrando…" : "Entrar"}
          </Button>
          <div className="flex items-center justify-between text-body-sm">
            <Link href="/esqueci-senha" className="text-text-3 hover:text-accent">
              Esqueci minha senha
            </Link>
            <button
              type="button"
              onClick={() => setMode("magic")}
              className="text-text-3 hover:text-accent"
            >
              Entrar com magic link
            </button>
          </div>
        </form>
      ) : (
        <form action={actionMagic} className="flex flex-col gap-md">
          <p className="text-body-sm text-text-3">
            Vamos te enviar um link de acesso único por e-mail.
          </p>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          {stateMagic.error ? (
            <p className="text-body-sm text-error">{stateMagic.error}</p>
          ) : null}
          {stateMagic.ok ? (
            <p className="text-body-sm text-success">
              Link enviado. Confira sua caixa de entrada.
            </p>
          ) : null}
          <Button type="submit" disabled={pendingMagic} className="w-full">
            {pendingMagic ? "Enviando…" : "Enviar link"}
          </Button>
          <button
            type="button"
            onClick={() => setMode("senha")}
            className="text-body-sm text-text-3 hover:text-accent text-left"
          >
            Voltar para senha
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-lg">
          <div className="flex flex-col gap-sm">
            <Eyebrow>Acesso</Eyebrow>
            <h1 className="text-h1 text-text-1">Entrar</h1>
            <GoldDivider className="mt-xs" />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

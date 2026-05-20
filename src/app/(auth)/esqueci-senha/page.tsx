"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eyebrow } from "@/components/brand/Eyebrow";
import { GoldDivider } from "@/components/brand/GoldDivider";
import { createClient } from "@/lib/supabase/client";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        setErro("Não foi possível enviar o link.");
      } else {
        setOk(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <Eyebrow>Recuperação</Eyebrow>
        <h1 className="text-h1 text-text-1">Esqueci a senha</h1>
        <GoldDivider className="mt-xs" />
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-md">
        <p className="text-body-sm text-text-3">
          Informe seu e-mail. Vamos enviar um link para você definir uma nova senha.
        </p>
        <div className="flex flex-col gap-xs">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {erro ? <p className="text-body-sm text-error">{erro}</p> : null}
        {ok ? (
          <p className="text-body-sm text-success">
            Verifique sua caixa de entrada.
          </p>
        ) : null}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Enviando…" : "Enviar link"}
        </Button>
        <Link
          href="/login"
          className="text-body-sm text-text-3 hover:text-accent text-left"
        >
          Voltar para login
        </Link>
      </form>
    </div>
  );
}

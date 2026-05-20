"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eyebrow } from "@/components/brand/Eyebrow";
import { GoldDivider } from "@/components/brand/GoldDivider";
import { createClient } from "@/lib/supabase/client";

export default function DuaFatorPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSubmitting(true);
    try {
      const supabase = createClient();
      // Pega o factor TOTP do usuário e tenta o challenge
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.[0];
      if (!totp) {
        setErro("Nenhum segundo fator configurado.");
        return;
      }
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (challengeError || !challenge) {
        setErro("Não foi possível iniciar a verificação.");
        return;
      }
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totp.id,
        challengeId: challenge.id,
        code: codigo.trim(),
      });
      if (verifyError) {
        setErro("Código inválido.");
        return;
      }
      router.replace("/");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <Eyebrow>Segurança</Eyebrow>
        <h1 className="text-h1 text-text-1">Verificação 2FA</h1>
        <GoldDivider className="mt-xs" />
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-md">
        <p className="text-body-sm text-text-3">
          Informe o código de 6 dígitos do seu app autenticador.
        </p>
        <div className="flex flex-col gap-xs">
          <Label htmlFor="codigo">Código</Label>
          <Input
            id="codigo"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            className="text-center text-h3 tracking-[0.4em] tabular-nums"
          />
        </div>
        {erro ? <p className="text-body-sm text-error">{erro}</p> : null}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Verificando…" : "Verificar"}
        </Button>
        <Link
          href="/login"
          className="text-body-sm text-text-3 hover:text-accent text-left"
        >
          Não tenho acesso ao app autenticador
        </Link>
      </form>
    </div>
  );
}

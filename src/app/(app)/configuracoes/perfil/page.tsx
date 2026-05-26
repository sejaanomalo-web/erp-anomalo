"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/feedback/Toast";
import { useMeuPerfil } from "@/lib/queries/profiles";
import { createClient } from "@/lib/supabase/client";

export default function PerfilPage() {
  const perfil = useMeuPerfil();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
  });
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  const [senha, setSenha] = useState({
    nova: "",
    confirmar: "",
  });
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useEffect(() => {
    if (perfil.data) {
      setForm({
        nome: perfil.data.nome ?? "",
        email: perfil.data.email ?? "",
        telefone: perfil.data.telefone ?? "",
        cargo: perfil.data.cargo ?? "",
      });
    }
  }, [perfil.data]);

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil.data?.id) return;
    setSalvandoPerfil(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          nome: form.nome.trim(),
          telefone: form.telefone.trim() || null,
          cargo: form.cargo.trim() || null,
        })
        .eq("id", perfil.data.id);
      if (error) throw error;
      toast.success("Perfil atualizado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (senha.nova.length < 8) {
      toast.error("A senha precisa de no mínimo 8 caracteres.");
      return;
    }
    if (senha.nova !== senha.confirmar) {
      toast.error("As senhas não conferem.");
      return;
    }
    setSalvandoSenha(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: senha.nova,
      });
      if (error) throw error;
      toast.success("Senha atualizada.");
      setSenha({ nova: "", confirmar: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao trocar senha.");
    } finally {
      setSalvandoSenha(false);
    }
  }

  return (
    <div className="flex flex-col gap-2xl max-w-2xl">
      <Hero
        eyebrow="Sistema"
        titulo="Perfil"
        descricao="Seus dados pessoais e senha de acesso."
      />

      <Card className="p-lg">
        <form onSubmit={salvarPerfil} className="flex flex-col gap-md">
          <span className="text-label-caps text-text-3">Dados pessoais</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Seu nome"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                readOnly
                disabled
                placeholder="voce@empresa.com"
              />
              <span className="text-caption text-text-4">
                Para trocar e-mail, peça ao admin.
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={form.telefone}
                onChange={(e) =>
                  setForm({ ...form, telefone: e.target.value })
                }
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={form.cargo}
                onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                placeholder="Ex: Gestor de produção"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={salvandoPerfil}>
              {salvandoPerfil ? "Salvando…" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-lg">
        <form onSubmit={trocarSenha} className="flex flex-col gap-md">
          <div className="flex flex-col gap-xxs">
            <span className="text-label-caps text-text-3">Senha</span>
            <span className="text-body-sm text-text-3">
              A nova senha será salva imediatamente. Você continuará logado.
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="senha_nova">Nova senha</Label>
              <Input
                id="senha_nova"
                type="password"
                value={senha.nova}
                onChange={(e) =>
                  setSenha({ ...senha, nova: e.target.value })
                }
                autoComplete="new-password"
                minLength={8}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="senha_confirmar">Confirmar nova senha</Label>
              <Input
                id="senha_confirmar"
                type="password"
                value={senha.confirmar}
                onChange={(e) =>
                  setSenha({ ...senha, confirmar: e.target.value })
                }
                autoComplete="new-password"
                minLength={8}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                salvandoSenha ||
                senha.nova.length < 8 ||
                senha.nova !== senha.confirmar
              }
            >
              {salvandoSenha ? "Trocando…" : "Trocar senha"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

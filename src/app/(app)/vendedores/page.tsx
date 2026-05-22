"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, UserCog, Copy } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { toast } from "@/components/feedback/Toast";
import { useVendedoresAdmin, useConvidarVendedor } from "@/lib/queries/vendedoresAdmin";
import { initials } from "@/lib/utils";
import type { Papel } from "@/types/database.types";

const PAPEL_LABEL: Record<Papel, string> = {
  admin: "Admin",
  gestor: "Gestor",
  financeiro: "Financeiro",
  vendedor: "Vendedor",
  producao: "Produção",
};

export default function VendedoresPage() {
  const vendedores = useVendedoresAdmin();
  const convidar = useConvidarVendedor();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    nome: string;
    email: string;
    telefone: string;
    papel: Papel;
  }>({
    nome: "",
    email: "",
    telefone: "",
    papel: "vendedor",
  });
  const [linkGerado, setLinkGerado] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.nome.trim().length < 2 || form.email.trim().length < 5) return;
    try {
      const res = await convidar.mutateAsync({
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim() || null,
        papel: form.papel,
      });
      toast.success("Convite criado.", {
        description:
          "O acesso foi gerado conforme o papel. Compartilhe o link abaixo com o vendedor.",
      });
      setLinkGerado(res.link);
      setForm({ nome: "", email: "", telefone: "", papel: "vendedor" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao convidar.");
    }
  }

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Time"
        titulo="Vendedores"
        descricao="Cadastre vendedores e defina o nível de acesso a cada um."
        acoes={
          <Button
            onClick={() => {
              setLinkGerado(null);
              setOpen(true);
            }}
          >
            <Plus size={14} strokeWidth={1.8} />
            Adicionar vendedor
          </Button>
        }
      />

      {vendedores.isLoading ? (
        <LoadingState linhas={4} />
      ) : (vendedores.data?.length ?? 0) === 0 ? (
        <EmptyState
          icone={UserCog}
          titulo="Nenhum vendedor cadastrado."
          descricao="Convide o primeiro para começar a registrar vendas pelo time."
          acao={
            <Button onClick={() => setOpen(true)}>
              <Plus size={14} strokeWidth={1.8} />
              Adicionar vendedor
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {vendedores.data?.map((v) => (
            <Link key={v.id} href={`/vendedores/${v.id}`}>
              <Card hover className="p-lg flex flex-col gap-md">
                <div className="flex items-start gap-md">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{initials(v.nome)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="block text-body-md text-text-1 truncate">
                      {v.nome}
                    </span>
                    <span className="block text-body-sm text-text-3 truncate">
                      {v.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-xs flex-wrap">
                  <Badge tone="accent">{PAPEL_LABEL[v.papel]}</Badge>
                  {!v.ativo ? <Badge tone="muted">Inativo</Badge> : null}
                  {v.telefone ? (
                    <span className="text-caption text-text-4">{v.telefone}</span>
                  ) : null}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setLinkGerado(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {linkGerado ? "Vendedor convidado" : "Adicionar vendedor"}
            </DialogTitle>
          </DialogHeader>

          {linkGerado ? (
            <div className="flex flex-col gap-md">
              <p className="text-body-md text-text-1">
                O acesso foi criado com sucesso. Compartilhe o link abaixo com o
                vendedor — ele cai direto no primeiro login.
              </p>
              <div className="flex flex-col gap-xs">
                <Label>Link de acesso</Label>
                <div className="flex gap-xs">
                  <Input
                    value={linkGerado}
                    readOnly
                    className="font-mono text-body-sm"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(linkGerado);
                      toast.success("Link copiado.");
                    }}
                  >
                    <Copy size={14} strokeWidth={1.8} />
                    Copiar
                  </Button>
                </div>
                <span className="text-caption text-text-4">
                  Este link é único e expira em 1 hora. Se expirar, peça reset
                  de senha pelo /login.
                </span>
              </div>
              <DialogFooter>
                <Button onClick={() => setOpen(false)}>Concluir</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-xs">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-xs">
                <Label htmlFor="telefone">Telefone (opcional)</Label>
                <Input
                  id="telefone"
                  type="tel"
                  value={form.telefone}
                  onChange={(e) =>
                    setForm({ ...form, telefone: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-xs">
                <Label>Papel base</Label>
                <Select
                  value={form.papel}
                  onValueChange={(v) =>
                    setForm({ ...form, papel: v as Papel })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendedor">
                      Vendedor (Vendas + Produção)
                    </SelectItem>
                    <SelectItem value="producao">
                      Produção (Produção + estoque)
                    </SelectItem>
                    <SelectItem value="financeiro">
                      Financeiro (Financeiro)
                    </SelectItem>
                    <SelectItem value="gestor">
                      Gestor (quase tudo)
                    </SelectItem>
                    <SelectItem value="admin">Admin (tudo)</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-caption text-text-4">
                  Você pode ampliar acessos individuais em Configurações &gt;
                  Permissões depois.
                </span>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={convidar.isPending}>
                  {convidar.isPending ? "Criando…" : "Gerar acesso"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Mail } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { CadastrarUsuarioDialog } from "@/components/usuarios/CadastrarUsuarioDialog";
import { useVendedoresAdmin } from "@/lib/queries/vendedoresAdmin";
import { formatDate, initials } from "@/lib/utils";
import type { Papel } from "@/types/database.types";

const PAPEL_LABEL: Record<Papel, string> = {
  admin: "Admin",
  gestor: "Gestor",
  financeiro: "Financeiro",
  vendedor: "Vendedor",
  producao: "Produção",
};

export default function UsuariosPage() {
  const usuarios = useVendedoresAdmin();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Sistema"
        titulo="Usuários"
        descricao="Todos os usuários com acesso ao sistema."
        acoes={
          <Button onClick={() => setOpen(true)}>
            <Plus size={14} strokeWidth={1.8} />
            Adicionar usuário
          </Button>
        }
      />

      {usuarios.isLoading ? (
        <LoadingState linhas={4} />
      ) : (usuarios.data?.length ?? 0) === 0 ? (
        <EmptyState
          icone={Mail}
          titulo="Nenhum usuário cadastrado."
          descricao="Cadastre usuários com diferentes papéis (admin, gestor, vendedor, produção, financeiro)."
          acao={
            <Button onClick={() => setOpen(true)}>
              <Plus size={14} strokeWidth={1.8} />
              Adicionar usuário
            </Button>
          }
        />
      ) : (
        <Card className="divide-y divide-border-thin">
          {usuarios.data?.map((u) => (
            <Link
              key={u.id}
              href={`/vendedores/${u.id}`}
              className="flex items-center justify-between gap-md p-md hover:bg-[var(--state-hover)] transition-colors duration-fast"
            >
              <div className="flex items-center gap-md min-w-0">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{initials(u.nome)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-xxs min-w-0">
                  <span className="text-body-md text-text-1 truncate">
                    {u.nome}
                  </span>
                  <span className="text-body-sm text-text-3 truncate">
                    {u.email}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-md flex-wrap justify-end">
                <Badge tone="accent">{PAPEL_LABEL[u.papel]}</Badge>
                {!u.ativo ? <Badge tone="muted">Inativo</Badge> : null}
                <span className="text-caption text-text-4">
                  Desde {formatDate(u.created_at)}
                </span>
              </div>
            </Link>
          ))}
        </Card>
      )}

      <CadastrarUsuarioDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

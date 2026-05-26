"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, UserCog } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { CadastrarUsuarioDialog } from "@/components/usuarios/CadastrarUsuarioDialog";
import { useVendedoresAdmin } from "@/lib/queries/vendedoresAdmin";
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
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Time"
        titulo="Vendedores"
        descricao="Cadastre vendedores e defina o nível de acesso a cada um."
        acoes={
          <Button onClick={() => setOpen(true)}>
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
          descricao="Cadastre o primeiro para começar a registrar vendas pelo time."
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
                    <span className="text-caption text-text-4">
                      {v.telefone}
                    </span>
                  ) : null}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CadastrarUsuarioDialog
        open={open}
        onOpenChange={setOpen}
        defaultPapel="vendedor"
      />
    </div>
  );
}

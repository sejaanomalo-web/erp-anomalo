"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { toast } from "@/components/feedback/Toast";
import {
  useClientes,
  useCriarCliente,
  type ClienteRow,
} from "@/lib/queries/clientes";
import { formatDate, maskCpfCnpj } from "@/lib/utils";

export default function ClientesPage() {
  const clientes = useClientes();
  const criar = useCriarCliente();
  const [open, setOpen] = useState(false);
  const [novo, setNovo] = useState({
    nome: "",
    cpf_cnpj: "",
    email: "",
    telefone: "",
  });

  const columns: DataTableColumn<ClienteRow>[] = [
    { key: "nome", label: "Cliente", render: (c) => c.nome, csv: (c) => c.nome },
    {
      key: "cpf_cnpj",
      label: "CPF/CNPJ",
      render: (c) => <span className="text-text-3">{maskCpfCnpj(c.cpf_cnpj)}</span>,
      csv: (c) => maskCpfCnpj(c.cpf_cnpj),
      hideOnMobile: true,
    },
    {
      key: "email",
      label: "E-mail",
      render: (c) => c.email ?? "—",
      csv: (c) => c.email ?? "",
      hideOnMobile: true,
    },
    {
      key: "telefone",
      label: "Telefone",
      render: (c) => c.telefone ?? "—",
      csv: (c) => c.telefone ?? "",
      hideOnMobile: true,
    },
    {
      key: "created_at",
      label: "Cadastrado em",
      render: (c) => formatDate(c.created_at),
      csv: (c) => formatDate(c.created_at),
    },
  ];

  async function submitNovo(e: React.FormEvent) {
    e.preventDefault();
    if (novo.nome.trim().length < 2) return;
    await criar.mutateAsync({
      nome: novo.nome.trim(),
      cpf_cnpj: novo.cpf_cnpj.trim() || null,
      email: novo.email.trim() || null,
      telefone: novo.telefone.trim() || null,
    });
    toast.success("Cliente cadastrado.");
    setOpen(false);
    setNovo({ nome: "", cpf_cnpj: "", email: "", telefone: "" });
  }

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Relacionamento"
        titulo="Clientes"
        descricao="Compradores ativos."
        acoes={
          <Button onClick={() => setOpen(true)}>
            <Plus size={14} strokeWidth={1.8} />
            Novo cliente
          </Button>
        }
      />

      {clientes.isLoading ? (
        <LoadingState linhas={6} />
      ) : (clientes.data?.length ?? 0) === 0 ? (
        <EmptyState
          icone={Users}
          titulo="Nenhum cliente cadastrado."
          descricao="Cadastre o primeiro cliente para começar."
          acao={
            <Button onClick={() => setOpen(true)}>
              <Plus size={14} strokeWidth={1.8} />
              Novo cliente
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={clientes.data ?? []}
          rowKey={(c) => c.id}
          exportName="clientes"
          onRowClick={(c) => {
            window.location.href = `/crm/clientes/${c.id}`;
          }}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitNovo} className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cliente_nome">Nome</Label>
              <Input
                id="cliente_nome"
                value={novo.nome}
                onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <Label htmlFor="cliente_cpf">CPF/CNPJ</Label>
                <Input
                  id="cliente_cpf"
                  value={novo.cpf_cnpj}
                  onChange={(e) =>
                    setNovo({ ...novo, cpf_cnpj: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-xs">
                <Label htmlFor="cliente_email">E-mail</Label>
                <Input
                  id="cliente_email"
                  type="email"
                  value={novo.email}
                  onChange={(e) => setNovo({ ...novo, email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cliente_tel">Telefone</Label>
              <Input
                id="cliente_tel"
                value={novo.telefone}
                onChange={(e) =>
                  setNovo({ ...novo, telefone: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={criar.isPending}>
                {criar.isPending ? "Salvando…" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { toast } from "@/components/feedback/Toast";
import {
  useAtualizarCliente,
  useCliente,
  useExcluirCliente,
} from "@/lib/queries/clientes";
import { useVendas } from "@/lib/queries/vendas";
import {
  initials,
  formatDate,
  maskCpfCnpj,
  formatCurrency,
} from "@/lib/utils";
import { VENDA_TIPO_LABEL, VENDA_TIPO_TONE } from "@/lib/constants";
import { VendaStatusBadge } from "@/components/tables/StatusBadge";

export default function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const cliente = useCliente(id);
  const vendas = useVendas();
  const atualizar = useAtualizarCliente(id);
  const excluir = useExcluirCliente();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    cpf_cnpj: "",
    origem: "",
    observacoes: "",
  });

  useEffect(() => {
    if (cliente.data) {
      setForm({
        nome: cliente.data.nome ?? "",
        telefone: cliente.data.telefone ?? "",
        email: cliente.data.email ?? "",
        cpf_cnpj: cliente.data.cpf_cnpj ?? "",
        origem: cliente.data.origem ?? "",
        observacoes:
          (cliente.data as { observacoes?: string }).observacoes ?? "",
      });
    }
  }, [cliente.data]);

  if (cliente.isLoading) return <LoadingState linhas={6} />;
  if (cliente.error || !cliente.data) {
    return (
      <div className="solid-surface p-lg flex flex-col gap-xs">
        <span className="text-label-caps text-error">Erro</span>
        <p className="text-body-md text-text-1">
          {cliente.error instanceof Error
            ? cliente.error.message
            : "Cliente não encontrado."}
        </p>
      </div>
    );
  }

  const c = cliente.data;
  const minhasVendas = (vendas.data ?? []).filter((v) => v.cliente_id === id);
  const totalGasto = minhasVendas
    .filter((v) => v.tipo === "venda")
    .reduce((acc, v) => acc + Number(v.valor_total), 0);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (form.nome.trim().length < 2) {
      toast.error("Nome obrigatório.");
      return;
    }
    try {
      await atualizar.mutateAsync({
        nome: form.nome,
        telefone: form.telefone,
        email: form.email,
        cpf_cnpj: form.cpf_cnpj,
        origem: form.origem,
        observacoes: form.observacoes,
      });
      toast.success("Cliente atualizado.");
      setEditOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar.");
    }
  }

  return (
    <div className="flex flex-col gap-2xl">
      <Link
        href="/crm/clientes"
        className="inline-flex items-center gap-xs text-body-sm text-text-3 hover:text-accent self-start"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Voltar a clientes
      </Link>

      <div className="flex flex-col md:flex-row md:items-center gap-md">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-h4">{initials(c.nome)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Hero
            eyebrow={c.origem ?? "Cliente"}
            titulo={c.nome}
            descricao={
              c.telefone
                ? `Telefone: ${c.telefone}.`
                : "Cliente cadastrado pelo fluxo de venda."
            }
            acoes={
              <div className="flex items-center gap-sm">
                <Button variant="secondary" onClick={() => setEditOpen(true)}>
                  <Pencil size={14} strokeWidth={1.8} />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={14} strokeWidth={1.8} />
                  Excluir
                </Button>
              </div>
            }
          />
        </div>
      </div>

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <Card className="p-lg">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xxs">
                <dt className="text-label-caps text-text-3">CPF/CNPJ</dt>
                <dd className="text-body-md text-text-1">
                  {maskCpfCnpj(c.cpf_cnpj)}
                </dd>
              </div>
              <div className="flex flex-col gap-xxs">
                <dt className="text-label-caps text-text-3">Telefone</dt>
                <dd className="text-body-md text-text-1">{c.telefone ?? "—"}</dd>
              </div>
              <div className="flex flex-col gap-xxs">
                <dt className="text-label-caps text-text-3">E-mail</dt>
                <dd className="text-body-md text-text-1">{c.email ?? "—"}</dd>
              </div>
              <div className="flex flex-col gap-xxs">
                <dt className="text-label-caps text-text-3">Origem</dt>
                <dd className="text-body-md text-text-1">{c.origem ?? "—"}</dd>
              </div>
              <div className="flex flex-col gap-xxs">
                <dt className="text-label-caps text-text-3">Cadastrado em</dt>
                <dd className="text-body-md text-text-1">
                  {formatDate(c.created_at)}
                </dd>
              </div>
              <div className="flex flex-col gap-xxs">
                <dt className="text-label-caps text-text-3">Total gasto</dt>
                <dd className="text-body-md text-text-1 tabular-nums">
                  {formatCurrency(totalGasto)}
                </dd>
              </div>
            </dl>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card className="divide-y divide-border-thin">
            {vendas.isLoading ? (
              <div className="p-lg">
                <LoadingState linhas={3} />
              </div>
            ) : minhasVendas.length === 0 ? (
              <div className="p-lg text-body-sm text-text-3">
                Este cliente ainda não tem vendas registradas.
              </div>
            ) : (
              minhasVendas.map((v) => (
                <Link
                  key={v.id}
                  href={`/vendas/${v.id}`}
                  className="flex items-center justify-between gap-md p-md hover:bg-surface-2 transition-colors duration-fast"
                >
                  <div className="flex flex-col gap-xxs min-w-0">
                    <span className="text-body-md text-text-1">
                      #{v.numero} · {formatDate(v.data_venda)}
                    </span>
                    <span className="text-body-sm text-text-3">
                      Entrega prevista {formatDate(v.data_prevista_entrega)}
                    </span>
                  </div>
                  <div className="flex items-center gap-md">
                    <Badge tone={VENDA_TIPO_TONE[v.tipo]}>
                      {VENDA_TIPO_LABEL[v.tipo]}
                    </Badge>
                    <VendaStatusBadge status={v.status} />
                    <span className="text-body-md tabular-nums text-text-1">
                      {formatCurrency(Number(v.valor_total))}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={salvar} className="flex flex-col gap-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <Label htmlFor="cli_nome">Nome</Label>
                <Input
                  id="cli_nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-xs">
                <Label htmlFor="cli_tel">Telefone</Label>
                <Input
                  id="cli_tel"
                  value={form.telefone}
                  onChange={(e) =>
                    setForm({ ...form, telefone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <Label htmlFor="cli_email">E-mail</Label>
                <Input
                  id="cli_email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-xs">
                <Label htmlFor="cli_doc">CPF/CNPJ</Label>
                <Input
                  id="cli_doc"
                  value={form.cpf_cnpj}
                  onChange={(e) =>
                    setForm({ ...form, cpf_cnpj: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cli_origem">Origem</Label>
              <Input
                id="cli_origem"
                value={form.origem}
                onChange={(e) => setForm({ ...form, origem: e.target.value })}
                placeholder="Indicação, Instagram, loja física…"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cli_obs">Observações</Label>
              <Textarea
                id="cli_obs"
                rows={3}
                value={form.observacoes}
                onChange={(e) =>
                  setForm({ ...form, observacoes: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={atualizar.isPending}>
                {atualizar.isPending ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        titulo={`Excluir ${c.nome}?`}
        descricao="Cliente sem vendas é removido em definitivo. Se houver vendas vinculadas, exclua-as primeiro."
        variant="destructive"
        textoConfirmar="Excluir cliente"
        palavraConfirmacao="EXCLUIR"
        onConfirm={async () => {
          try {
            await excluir.mutateAsync(id);
            toast.success("Cliente excluído.");
            router.push("/crm/clientes");
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Falha ao excluir.",
            );
          }
        }}
      />
    </div>
  );
}

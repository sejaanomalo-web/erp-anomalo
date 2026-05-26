"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, UserMinus, UserCog, Trash2 } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { KPICard } from "@/components/sections/KPICard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { toast } from "@/components/feedback/Toast";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import {
  useAtualizarVendedorPerfil,
  useDesativarVendedor,
  useExcluirVendedor,
  useVendedor,
} from "@/lib/queries/vendedoresAdmin";
import { useMeuPerfil } from "@/lib/queries/profiles";
import { initials, formatCurrency, formatDate } from "@/lib/utils";
import { VENDA_TIPO_LABEL, VENDA_TIPO_TONE } from "@/lib/constants";
import type { Papel } from "@/types/database.types";

const PAPEL_LABEL: Record<Papel, string> = {
  admin: "Admin",
  gestor: "Gestor",
  financeiro: "Financeiro",
  vendedor: "Vendedor",
  producao: "Produção",
};

interface AgrupadoProduto {
  produto: string;
  quantidade: number;
  vendas: number;
  valor: number;
}

export default function VendedorDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, error } = useVendedor(id);
  const meuPerfil = useMeuPerfil();
  const atualizar = useAtualizarVendedorPerfil();
  const desativar = useDesativarVendedor();
  const excluir = useExcluirVendedor();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    cargo: "",
    papel: "vendedor" as Papel,
  });

  useEffect(() => {
    if (data?.perfil) {
      setForm({
        nome: data.perfil.nome ?? "",
        telefone: data.perfil.telefone ?? "",
        cargo: data.perfil.cargo ?? "",
        papel: data.perfil.papel,
      });
    }
  }, [data?.perfil]);

  const porProduto: AgrupadoProduto[] = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, AgrupadoProduto>();
    for (const it of data.itens) {
      const key = (it.produto_descricao ?? "Sem descrição").trim();
      const cur = map.get(key) ?? {
        produto: key,
        quantidade: 0,
        vendas: 0,
        valor: 0,
      };
      cur.quantidade += it.quantidade;
      cur.vendas += 1;
      cur.valor += it.quantidade * it.valor_unitario;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => b.valor - a.valor);
  }, [data]);

  if (isLoading) return <LoadingState linhas={6} />;
  if (error || !data) {
    return (
      <div className="solid-surface p-lg flex flex-col gap-xs">
        <span className="text-label-caps text-error">Erro</span>
        <p className="text-body-md text-text-1">
          {error instanceof Error ? error.message : "Vendedor não encontrado."}
        </p>
      </div>
    );
  }

  const colunasProdutos: DataTableColumn<AgrupadoProduto>[] = [
    {
      key: "produto",
      label: "Produto",
      render: (p) => <span className="text-text-1">{p.produto}</span>,
      csv: (p) => p.produto,
    },
    {
      key: "quantidade",
      label: "Qtd. total",
      align: "right",
      render: (p) => p.quantidade,
      csv: (p) => String(p.quantidade),
    },
    {
      key: "vendas",
      label: "Itens em vendas",
      align: "right",
      render: (p) => p.vendas,
      csv: (p) => String(p.vendas),
      hideOnMobile: true,
    },
    {
      key: "valor",
      label: "Valor total",
      align: "right",
      render: (p) => formatCurrency(p.valor),
      csv: (p) => formatCurrency(p.valor),
    },
  ];

  const colunasItens: DataTableColumn<(typeof data.itens)[number]>[] = [
    {
      key: "numero",
      label: "Venda",
      render: (it) => (
        <Link
          href={`/vendas/${it.id}`}
          className="text-accent hover:underline"
        >
          #{it.numero}
        </Link>
      ),
      csv: (it) => `#${it.numero}`,
    },
    {
      key: "data_venda",
      label: "Data",
      render: (it) => formatDate(it.data_venda),
      csv: (it) => formatDate(it.data_venda),
    },
    {
      key: "produto",
      label: "Produto",
      render: (it) => it.produto_descricao ?? "—",
      csv: (it) => it.produto_descricao ?? "",
    },
    {
      key: "quantidade",
      label: "Qtd.",
      align: "right",
      render: (it) => it.quantidade,
      csv: (it) => String(it.quantidade),
    },
    {
      key: "valor",
      label: "Valor un.",
      align: "right",
      render: (it) => formatCurrency(it.valor_unitario),
      csv: (it) => formatCurrency(it.valor_unitario),
      hideOnMobile: true,
    },
    {
      key: "tipo",
      label: "Tipo",
      render: (it) => (
        <Badge tone={VENDA_TIPO_TONE[it.tipo]}>{VENDA_TIPO_LABEL[it.tipo]}</Badge>
      ),
      csv: (it) => VENDA_TIPO_LABEL[it.tipo],
      hideOnMobile: true,
    },
  ];

  return (
    <div className="flex flex-col gap-2xl">
      <Link
        href="/vendedores"
        className="inline-flex items-center gap-xs text-body-sm text-text-3 hover:text-accent self-start"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Voltar à equipe
      </Link>

      <div className="flex items-start gap-md">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-h4">
            {initials(data.perfil.nome)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Hero
            eyebrow={PAPEL_LABEL[data.perfil.papel]}
            titulo={data.perfil.nome}
            descricao={data.perfil.email}
            acoes={
              <div className="flex items-center gap-sm">
                <Button variant="secondary" onClick={() => setEditOpen(true)}>
                  <Pencil size={14} strokeWidth={1.8} />
                  Editar
                </Button>
                {data.perfil.ativo ? (
                  <Button
                    variant="secondary"
                    onClick={() => setConfirmDeactivate(true)}
                  >
                    <UserMinus size={14} strokeWidth={1.8} />
                    Desativar
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await atualizar.mutateAsync({ id, ativo: true });
                        toast.success("Vendedor reativado.");
                      } catch (err) {
                        toast.error(
                          err instanceof Error
                            ? err.message
                            : "Falha ao reativar.",
                        );
                      }
                    }}
                    disabled={atualizar.isPending}
                  >
                    Reativar
                  </Button>
                )}
                {meuPerfil.data?.papel === "admin" &&
                meuPerfil.data?.id !== id ? (
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                    Excluir
                  </Button>
                ) : null}
              </div>
            }
          />
          {!data.perfil.ativo ? (
            <div className="mt-xs">
              <Badge tone="muted">Inativo</Badge>
            </div>
          ) : null}
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
        <KPICard label="Vendas fechadas" valor={data.agregado.totalVendas} />
        <KPICard
          label="Orçamentos abertos"
          valor={data.agregado.totalOrcamentos}
        />
        <KPICard
          label="Valor fechado"
          valor={data.agregado.valorFechado}
          formato="moeda"
        />
        <KPICard
          label="Comissão acumulada"
          valor={data.agregado.comissaoTotal}
          formato="moeda"
        />
      </section>

      <section className="flex flex-col gap-md">
        <span className="text-label-caps text-text-3">Produtos vendidos</span>
        {porProduto.length === 0 ? (
          <EmptyState
            icone={UserCog}
            titulo="Sem vendas registradas."
            descricao="Quando este vendedor registrar a primeira venda, aparece aqui."
          />
        ) : (
          <DataTable
            columns={colunasProdutos}
            data={porProduto}
            rowKey={(p) => p.produto}
            exportName={`vendedor-${data.perfil.nome}-produtos`}
          />
        )}
      </section>

      <section className="flex flex-col gap-md">
        <span className="text-label-caps text-text-3">Histórico de itens</span>
        {data.itens.length === 0 ? (
          <Card className="p-lg">
            <p className="text-body-sm text-text-3">
              Nenhum item vendido por este vendedor ainda.
            </p>
          </Card>
        ) : (
          <DataTable
            columns={colunasItens}
            data={data.itens}
            rowKey={(it) => it.id}
            exportName={`vendedor-${data.perfil.nome}-itens`}
          />
        )}
      </section>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar vendedor</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (form.nome.trim().length < 2) {
                toast.error("Nome obrigatório.");
                return;
              }
              try {
                await atualizar.mutateAsync({
                  id,
                  nome: form.nome,
                  telefone: form.telefone,
                  cargo: form.cargo,
                  papel: form.papel,
                });
                toast.success("Vendedor atualizado.");
                setEditOpen(false);
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Falha ao salvar.",
                );
              }
            }}
            className="flex flex-col gap-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <Label htmlFor="vend_nome">Nome</Label>
                <Input
                  id="vend_nome"
                  value={form.nome}
                  onChange={(e) =>
                    setForm({ ...form, nome: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-xs">
                <Label htmlFor="vend_tel">Telefone</Label>
                <Input
                  id="vend_tel"
                  value={form.telefone}
                  onChange={(e) =>
                    setForm({ ...form, telefone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <Label htmlFor="vend_cargo">Cargo</Label>
                <Input
                  id="vend_cargo"
                  value={form.cargo}
                  onChange={(e) =>
                    setForm({ ...form, cargo: e.target.value })
                  }
                  placeholder="Ex: Vendedor sênior"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <Label>Papel</Label>
                <Select
                  value={form.papel}
                  onValueChange={(v) => setForm({ ...form, papel: v as Papel })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="producao">Produção</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        titulo={`Desativar ${data.perfil.nome}?`}
        descricao="O usuário fica sem acesso ao sistema mas o histórico de vendas/lançamentos é preservado. Você pode reativar depois."
        variant="destructive"
        textoConfirmar="Desativar"
        onConfirm={async () => {
          try {
            await desativar.mutateAsync(id);
            toast.success("Vendedor desativado.");
            setConfirmDeactivate(false);
            router.push("/vendedores");
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Falha ao desativar.",
            );
          }
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        titulo={`Excluir ${data.perfil.nome}?`}
        descricao="Esta ação remove o usuário em definitivo (perfil + conta de acesso). Se houver vendas, lançamentos ou produções vinculadas, a exclusão é recusada — desative em vez de excluir, ou reatribua os registros antes."
        variant="destructive"
        textoConfirmar="Excluir usuário"
        palavraConfirmacao="EXCLUIR"
        onConfirm={async () => {
          try {
            await excluir.mutateAsync(id);
            toast.success("Vendedor excluído.");
            setConfirmDelete(false);
            router.push("/vendedores");
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

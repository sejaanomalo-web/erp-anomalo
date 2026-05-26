"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/feedback/Toast";
import { useConvidarVendedor } from "@/lib/queries/vendedoresAdmin";
import type { Papel } from "@/types/database.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPapel?: Papel;
}

interface Credenciais {
  email: string;
  senha: string;
  jaExistia: boolean;
}

const PAPEIS: { value: Papel; label: string; descricao: string }[] = [
  {
    value: "vendedor",
    label: "Vendedor",
    descricao: "Vendas + Produção",
  },
  {
    value: "producao",
    label: "Produção",
    descricao: "Produção + Estoque",
  },
  {
    value: "financeiro",
    label: "Financeiro",
    descricao: "Acesso ao financeiro",
  },
  {
    value: "gestor",
    label: "Gestor",
    descricao: "Quase tudo, exceto admin",
  },
  {
    value: "admin",
    label: "Admin",
    descricao: "Acesso total ao sistema",
  },
];

export function CadastrarUsuarioDialog({
  open,
  onOpenChange,
  defaultPapel = "vendedor",
}: Props) {
  const convidar = useConvidarVendedor();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    papel: defaultPapel as Papel,
  });
  const [credenciais, setCredenciais] = useState<Credenciais | null>(null);

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
      toast.success(
        res.ja_existia ? "Senha redefinida." : "Usuário cadastrado.",
      );
      setCredenciais({
        email: res.email,
        senha: res.senha_temporaria,
        jaExistia: res.ja_existia,
      });
      setForm({
        nome: "",
        email: "",
        telefone: "",
        papel: defaultPapel,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao cadastrar.");
    }
  }

  function copiarAmbos() {
    if (!credenciais) return;
    const texto = `E-mail: ${credenciais.email}\nSenha temporária: ${credenciais.senha}`;
    navigator.clipboard.writeText(texto);
    toast.success("Credenciais copiadas.");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setCredenciais(null);
          setForm({
            nome: "",
            email: "",
            telefone: "",
            papel: defaultPapel,
          });
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {credenciais
              ? credenciais.jaExistia
                ? "Senha redefinida"
                : "Usuário cadastrado"
              : "Adicionar usuário"}
          </DialogTitle>
        </DialogHeader>

        {credenciais ? (
          <div className="flex flex-col gap-md">
            <p className="text-body-md text-text-1">
              {credenciais.jaExistia
                ? "Este e-mail já tinha cadastro. A senha foi redefinida para a temporária abaixo."
                : "Usuário criado. Compartilhe as credenciais abaixo com a pessoa — recomenda-se que ela troque a senha no primeiro acesso em Configurações > Perfil."}
            </p>
            <div className="flex flex-col gap-xs">
              <Label>E-mail</Label>
              <Input
                value={credenciais.email}
                readOnly
                className="font-mono text-body-sm"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Senha temporária</Label>
              <div className="flex gap-xs">
                <Input
                  value={credenciais.senha}
                  readOnly
                  className="font-mono text-body-sm"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(credenciais.senha);
                    toast.success("Senha copiada.");
                  }}
                >
                  <Copy size={14} strokeWidth={1.8} />
                  Copiar
                </Button>
              </div>
              <span className="text-caption text-text-4">
                A senha NÃO será exibida de novo. Salve agora se não copiou.
              </span>
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                type="button"
                onClick={copiarAmbos}
              >
                <Copy size={14} strokeWidth={1.8} />
                Copiar tudo
              </Button>
              <Button onClick={() => onOpenChange(false)}>Concluir</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cad_nome">Nome</Label>
              <Input
                id="cad_nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cad_email">E-mail</Label>
              <Input
                id="cad_email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cad_telefone">Telefone (opcional)</Label>
              <Input
                id="cad_telefone"
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
                  {PAPEIS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label} — {p.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-caption text-text-4">
                Acessos extras podem ser ampliados em Configurações &gt;
                Permissões.
              </span>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={convidar.isPending}>
                {convidar.isPending ? "Cadastrando…" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

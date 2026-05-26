"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Upload, X } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/LoadingState";
import { toast } from "@/components/feedback/Toast";
import {
  useEmpresa,
  useSalvarEmpresa,
  useUploadLogoEmpresa,
} from "@/lib/queries/empresa";
import { formatCpfCnpj } from "@/lib/utils";

export default function EmpresaPage() {
  const empresa = useEmpresa();
  const salvar = useSalvarEmpresa();
  const upload = useUploadLogoEmpresa();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
  });

  useEffect(() => {
    if (empresa.data) {
      setForm({
        nome: empresa.data.nome ?? "",
        cnpj: empresa.data.cnpj ?? "",
      });
    }
  }, [empresa.data]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.nome.trim().length < 2) {
      toast.error("Informe a razão social.");
      return;
    }
    try {
      await salvar.mutateAsync({
        nome: form.nome,
        cnpj: form.cnpj || null,
      });
      toast.success("Dados da empresa atualizados.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar.");
    }
  }

  async function onPickFile(file: File | null) {
    if (!file) return;
    try {
      await upload.mutateAsync(file);
      toast.success("Logo atualizado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao enviar logo.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function removerLogo() {
    try {
      await salvar.mutateAsync({
        nome: form.nome,
        cnpj: form.cnpj || null,
        logo_url: null,
      });
      toast.success("Logo removido.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao remover.");
    }
  }

  if (empresa.isLoading) {
    return (
      <div className="flex flex-col gap-2xl max-w-3xl">
        <Hero
          eyebrow="Sistema"
          titulo="Empresa"
          descricao="Razão social, CNPJ e logo."
        />
        <LoadingState linhas={4} />
      </div>
    );
  }

  const logoUrl = empresa.data?.logo_url ?? null;

  return (
    <div className="flex flex-col gap-2xl max-w-3xl">
      <Hero
        eyebrow="Sistema"
        titulo="Empresa"
        descricao="Razão social, CNPJ e logo. O logo aparece em e-mails transacionais e no header."
      />

      {/* Card de logo */}
      <Card className="p-lg flex flex-col gap-md">
        <span className="text-label-caps text-text-3">Logo da empresa</span>
        <div className="flex items-center gap-lg flex-wrap">
          <div className="flex items-center justify-center w-32 h-32 rounded-lg border border-border-thin bg-surface-2 overflow-hidden">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Logo da empresa"
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2
                size={40}
                strokeWidth={1.4}
                className="text-text-4"
                aria-hidden
              />
            )}
          </div>
          <div className="flex flex-col gap-sm">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex gap-sm">
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={upload.isPending}
              >
                <Upload size={14} strokeWidth={1.8} />
                {upload.isPending
                  ? "Enviando…"
                  : logoUrl
                    ? "Trocar logo"
                    : "Enviar logo"}
              </Button>
              {logoUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={removerLogo}
                  disabled={upload.isPending || salvar.isPending}
                >
                  <X size={14} strokeWidth={1.8} />
                  Remover
                </Button>
              ) : null}
            </div>
            <span className="text-caption text-text-4 max-w-xs">
              PNG, JPEG ou WebP, até 8 MB. Recomendado quadrado ou
              proporção 4:3, com fundo transparente.
            </span>
          </div>
        </div>
      </Card>

      {/* Card de dados */}
      <Card className="p-lg">
        <form onSubmit={onSubmit} className="flex flex-col gap-md">
          <span className="text-label-caps text-text-3">Dados cadastrais</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="razao">Razão social</Label>
              <Input
                id="razao"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
                placeholder="Tꓥto Estofados LTDA"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={form.cnpj}
                onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
              {form.cnpj ? (
                <span className="text-caption text-text-4">
                  Formato: {formatCpfCnpj(form.cnpj) || form.cnpj}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={salvar.isPending}>
              {salvar.isPending ? "Salvando…" : "Salvar dados"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

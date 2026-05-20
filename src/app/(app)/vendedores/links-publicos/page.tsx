"use client";

import { useState } from "react";
import { Plus, Link as LinkIcon } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { toast } from "@/components/feedback/Toast";
import { formatDate } from "@/lib/utils";
import { PUBLIC_TOKEN_DEFAULT_EXPIRY_DAYS } from "@/lib/constants";
import { addDays } from "date-fns";

interface Token {
  id: string;
  vendedor: string;
  descricao: string;
  expira_em: string;
  total_usos: number;
  ativo: boolean;
}

const seed: Token[] = [
  {
    id: "tok-1",
    vendedor: "Bruna Marques",
    descricao: "Visitas externas",
    expira_em: addDays(new Date(), 60).toISOString(),
    total_usos: 14,
    ativo: true,
  },
  {
    id: "tok-2",
    vendedor: "Diego Faria",
    descricao: "Loja Centro",
    expira_em: addDays(new Date(), 30).toISOString(),
    total_usos: 7,
    ativo: true,
  },
];

export default function LinksPublicosPage() {
  const [tokens, setTokens] = useState<Token[]>(seed);
  const [revogar, setRevogar] = useState<Token | null>(null);

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Time"
        titulo="Links públicos"
        descricao={`Cada vendedor pode ter até 3 tokens ativos. Default: ${PUBLIC_TOKEN_DEFAULT_EXPIRY_DAYS} dias.`}
        acoes={
          <Button>
            <Plus size={14} strokeWidth={1.8} />
            Novo link
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        {tokens.map((tok) => (
          <Card key={tok.id} className="p-lg flex flex-col gap-md">
            <div className="flex items-center justify-between gap-sm">
              <span className="text-label-caps text-text-3">{tok.vendedor}</span>
              {tok.ativo ? (
                <Badge tone="success">Ativo</Badge>
              ) : (
                <Badge tone="muted">Revogado</Badge>
              )}
            </div>
            <div>
              <span className="text-h3 text-text-1">{tok.descricao}</span>
              <p className="text-body-sm text-text-3 mt-xs inline-flex items-center gap-xs">
                <LinkIcon size={14} strokeWidth={1.8} />
                /formulario/venda/{tok.id}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-sm text-body-sm">
              <div>
                <dt className="text-text-3">Expira em</dt>
                <dd className="text-text-1">{formatDate(tok.expira_em)}</dd>
              </div>
              <div>
                <dt className="text-text-3">Usos</dt>
                <dd className="text-text-1 tabular-nums">{tok.total_usos}</dd>
              </div>
            </dl>
            <div className="flex items-center justify-end gap-sm mt-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/formulario/venda/${tok.id}`,
                  );
                  toast.success("Link copiado.");
                }}
              >
                Copiar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setRevogar(tok)}
              >
                Revogar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(revogar)}
        onOpenChange={(o) => !o && setRevogar(null)}
        titulo="Revogar este link?"
        descricao="O link deixa de funcionar imediatamente. Não dá para reativar."
        variant="destructive"
        palavraConfirmacao="REVOGAR"
        textoConfirmar="Revogar agora"
        onConfirm={() => {
          if (!revogar) return;
          setTokens((prev) =>
            prev.map((t) => (t.id === revogar.id ? { ...t, ativo: false } : t)),
          );
          setRevogar(null);
          toast.success("Link revogado.");
        }}
      />
    </div>
  );
}

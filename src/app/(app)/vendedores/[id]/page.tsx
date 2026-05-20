"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { KPICard } from "@/components/sections/KPICard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { mockVendedores } from "@/lib/mocks";
import { initials } from "@/lib/utils";

export default function VendedorDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const v = mockVendedores.find((x) => x.id === id) ?? mockVendedores[0];

  return (
    <div className="flex flex-col gap-2xl">
      <Link
        href="/vendedores"
        className="inline-flex items-center gap-xs text-body-sm text-text-3 hover:text-accent self-start"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Voltar à equipe
      </Link>
      <div className="flex items-center gap-md">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-h4">{initials(v.nome)}</AvatarFallback>
        </Avatar>
        <Hero eyebrow="Vendedor" titulo={v.nome} />
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
        <KPICard label="Vendas no mês" valor={v.vendasMes} />
        <KPICard label="Ticket médio" valor={v.ticketMedio} formato="moeda" />
        <KPICard label="Comissão" valor={v.comissaoMes} formato="moeda" />
        <KPICard label="Conversão" valor={v.conversao} formato="percentual" />
      </section>

      <Card className="p-lg">
        <p className="text-body-md text-text-3">
          Histórico de vendas, comissões pagas e metas mensais aparecerão aqui.
        </p>
      </Card>
    </div>
  );
}

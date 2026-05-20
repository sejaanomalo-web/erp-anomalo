"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockClientes } from "@/lib/mocks";
import { initials, formatDate, maskCpfCnpj } from "@/lib/utils";

export default function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const c = mockClientes.find((x) => x.id === id) ?? mockClientes[0];

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
            eyebrow={c.origem}
            titulo={c.nome}
            descricao={`Última compra em ${formatDate(c.ultima_compra)}.`}
            acoes={
              <Button variant="secondary">
                <Download size={14} strokeWidth={1.8} />
                Exportar dados (LGPD)
              </Button>
            }
          />
        </div>
      </div>

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="interacoes">Interações</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
        </TabsList>
        <TabsContent value="perfil">
          <Card className="p-lg">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xxs">
                <dt className="text-label-caps text-text-3">CPF/CNPJ</dt>
                <dd className="text-body-md text-text-1">{maskCpfCnpj(c.cpf_cnpj)}</dd>
              </div>
              <div className="flex flex-col gap-xxs">
                <dt className="text-label-caps text-text-3">E-mail</dt>
                <dd className="text-body-md text-text-1">{c.email}</dd>
              </div>
              <div className="flex flex-col gap-xxs">
                <dt className="text-label-caps text-text-3">Origem</dt>
                <dd className="text-body-md text-text-1">{c.origem}</dd>
              </div>
            </dl>
          </Card>
        </TabsContent>
        <TabsContent value="historico">
          <Card className="p-lg">
            <p className="text-body-md text-text-3">
              Lista cronológica de vendas deste cliente.
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="interacoes">
          <Card className="p-lg">
            <p className="text-body-md text-text-3">
              Ligações, WhatsApp, e-mails, visitas e reuniões.
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="anexos">
          <Card className="p-lg">
            <p className="text-body-md text-text-3">
              Documentos do cliente armazenados no Supabase Storage.
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="notas">
          <Card className="p-lg">
            <p className="text-body-md text-text-3">
              Notas internas da equipe sobre o relacionamento.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

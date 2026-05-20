"use client";

import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function PerfilPage() {
  return (
    <div className="flex flex-col gap-2xl max-w-2xl">
      <Hero
        eyebrow="Sistema"
        titulo="Perfil"
        descricao="Dados pessoais, senha e 2FA."
      />
      <Card className="p-lg flex flex-col gap-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="flex flex-col gap-xs">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" defaultValue="" placeholder="Seu nome" />
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" defaultValue="" placeholder="voce@empresa.com" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="flex flex-col gap-xs">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" placeholder="(00) 00000-0000" />
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="cargo">Cargo</Label>
            <Input id="cargo" placeholder="Gestor de produção" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-md pt-md border-t border-border-thin">
          <div className="flex flex-col gap-xxs">
            <span className="text-body-md text-text-1">Autenticação em 2 fatores</span>
            <span className="text-body-sm text-text-3">
              Recomendado. Vamos te orientar a configurar pelo app autenticador.
            </span>
          </div>
          <Switch />
        </div>
        <div className="flex justify-end pt-md">
          <Button>Salvar alterações</Button>
        </div>
      </Card>
    </div>
  );
}

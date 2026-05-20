"use client";

import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function EmpresaPage() {
  return (
    <div className="flex flex-col gap-2xl max-w-2xl">
      <Hero
        eyebrow="Sistema"
        titulo="Empresa"
        descricao="Razão social, CNPJ, logo e dados fiscais."
      />
      <Card className="p-lg flex flex-col gap-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="flex flex-col gap-xs">
            <Label htmlFor="razao">Razão social</Label>
            <Input id="razao" />
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" placeholder="00.000.000/0000-00" />
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <Label htmlFor="endereco">Endereço</Label>
          <Textarea id="endereco" rows={3} />
        </div>
        <div className="flex justify-end">
          <Button>Salvar</Button>
        </div>
      </Card>
    </div>
  );
}

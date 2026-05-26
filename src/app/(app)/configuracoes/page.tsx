"use client";

import Link from "next/link";
import {
  Palette,
  Users,
  Bell,
  HardDrive,
  ArrowRight,
} from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";

const SECOES = [
  { href: "/configuracoes/aparencia", titulo: "Aparência", descricao: "Tema claro ou escuro.", icone: Palette },
  { href: "/configuracoes/usuarios", titulo: "Usuários", descricao: "Cadastros, papéis e status.", icone: Users },
  { href: "/configuracoes/notificacoes", titulo: "Notificações", descricao: "Preferências in-app e e-mail.", icone: Bell },
  { href: "/configuracoes/backup", titulo: "Backup", descricao: "Export e retenção.", icone: HardDrive },
];

export default function ConfiguracoesPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Sistema"
        titulo="Configurações"
        descricao="Controle da empresa."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {SECOES.map((s) => {
          const Icon = s.icone;
          return (
            <Link key={s.href} href={s.href}>
              <Card hover className="p-lg flex flex-col gap-sm">
                <div className="flex items-center gap-sm">
                  <Icon size={16} strokeWidth={1.8} className="text-text-3" />
                  <span className="text-label-caps text-text-3">{s.titulo}</span>
                </div>
                <span className="text-body-md text-text-1">{s.descricao}</span>
                <span className="text-body-sm text-accent inline-flex items-center gap-xs mt-md">
                  Abrir
                  <ArrowRight size={14} strokeWidth={1.8} />
                </span>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

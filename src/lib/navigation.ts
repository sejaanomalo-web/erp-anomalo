import {
  LayoutDashboard,
  ShoppingCart,
  Hammer,
  Wallet,
  Boxes,
  Users,
  UserCog,
  FileBarChart,
  Settings,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import type { Modulo } from "@/lib/permissions/matrix";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  modulo: Modulo | null;
}

// O rail filtra automaticamente pelo papel via usePermissions.canAccess.
// Para vendedor isso significa só Dashboard, Vendas, Produção e Agenda visíveis.
export const NAV: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, modulo: null },
  { label: "Vendas", href: "/vendas", icon: ShoppingCart, modulo: "vendas" },
  { label: "Produção", href: "/producao", icon: Hammer, modulo: "producao" },
  { label: "Agenda", href: "/agenda", icon: Calendar, modulo: "agenda" },
  { label: "Materiais", href: "/materiais", icon: Boxes, modulo: "materiais" },
  { label: "Financeiro", href: "/financeiro", icon: Wallet, modulo: "financeiro" },
  { label: "CRM", href: "/crm", icon: Users, modulo: "crm" },
  { label: "Vendedores", href: "/vendedores", icon: UserCog, modulo: "vendedores" },
  { label: "Relatórios", href: "/relatorios", icon: FileBarChart, modulo: "relatorios" },
  { label: "Configurações", href: "/configuracoes", icon: Settings, modulo: "configuracoes" },
];

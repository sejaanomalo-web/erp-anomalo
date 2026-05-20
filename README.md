# ERP Anômalo

Sistema operacional interno da Anômalo Hub (primeira implantação: Aton Estofados).

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 3 com tokens da identidade Anômalo
- Supabase (PostgreSQL + Auth + Storage + Realtime + RLS)
- shadcn/ui customizado em `src/components/ui`
- TanStack Query, Zustand, React Hook Form + Zod
- Recharts, dnd-kit, Framer Motion, react-day-picker, date-fns
- Resend (e-mail) e Sentry (monitoramento)

## Estrutura

```
src/
├── app/
│   ├── (app)/        rotas autenticadas com AppShell
│   ├── (auth)/       login, esqueci senha, 2FA
│   ├── formulario/   formulário público por token
│   └── api/          rotas server-side (ex: /api/health)
├── components/
│   ├── brand/        AnomaloMark, GoldDivider, Eyebrow
│   ├── ui/           override de primitivas (cantos vivos, paleta gold)
│   ├── layout/       Rail, MobileDrawer, NotificationBell, AppShell
│   ├── sections/     Hero, KPICard
│   ├── tables/       DataTable, StatusBadge
│   ├── kanban/       KanbanBoard (dnd-kit + Framer Motion)
│   ├── calendar/     CalendarView (mês e lista)
│   ├── forms/        MultiStepForm com auto-save
│   ├── search/       CommandPalette (Cmd+K / Ctrl+K)
│   └── feedback/     EmptyState, ConfirmDialog, LoadingState, Toast (sonner)
├── lib/
│   ├── supabase/     clients browser, server, middleware
│   ├── permissions/  matriz de papéis (admin, gestor, vendedor, financeiro, producao)
│   ├── audit/        logger de audit_logs
│   ├── csv/          export utilitário
│   ├── email/        Resend client + templates
│   ├── navigation.ts itens do rail
│   ├── constants.ts  labels e tons de status, defaults
│   └── mocks.ts      dados de exemplo enquanto o Supabase não está conectado
├── hooks/            useAuth, usePermissions, useDebounce, useAutoSave, useRealtimeNotifications
└── types/            database.types.ts (stub, regenerar após Supabase)
```

## Migrations

Em `supabase/migrations/`. Aplicar na ordem cronológica do prefixo. Detalhes em
`supabase/migrations/README.md`.

## Variáveis de ambiente

Veja `.env.local.example`. Copie para `.env.local` e preencha após:

1. Criar o projeto Supabase dedicado (`erp-anomalo`).
2. Verificar o domínio do Resend (`anomalohub.com`).
3. Configurar o projeto Sentry (`erp-anomalo`).

## Scripts

```bash
npm run dev      # ambiente local em http://localhost:3000
npm run build    # produção
npm run start    # produção (após build)
npm run lint     # eslint
```

## Próximos passos (na ordem)

1. Criar projeto Supabase `erp-anomalo` e preencher `.env.local`.
2. Aplicar migrations (`supabase/migrations/`).
3. Gerar tipos: `npx supabase gen types typescript --project-id <id> > src/types/database.types.ts`.
4. Substituir `lib/mocks.ts` por queries reais nas páginas (TanStack Query).
5. Configurar Resend (verificação de domínio) e Sentry.
6. Playwright suites (`tests/`).
7. Deploy Vercel + domínio.

## Identidade visual

- Preto absoluto `#000000` no canvas.
- Dourado `#C9953A` como detalhe raro.
- Inter via `next/font/google`, com `ss01`, `cv11`, `tnum`.
- Cantos vivos (sem `rounded-*`, salvo `full` para pílulas e avatares).
- Sem palavras proibidas da marca em copy. Sem em-dash em texto.
- Símbolo Λ no canto inferior direito do App Shell (marca d'água sutil).

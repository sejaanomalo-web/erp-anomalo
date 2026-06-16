import { Suspense } from "react";

// Boundary de Suspense para o módulo Financeiro: as páginas e a FinanceiroNav
// usam useSearchParams (período global), que exige um Suspense acima na
// geração estática do Next.
export default function FinanceiroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

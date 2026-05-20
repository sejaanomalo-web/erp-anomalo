import { AnomaloMark } from "@/components/brand/AnomaloMark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-md py-2xl">
      <div className="w-full max-w-md flex flex-col gap-2xl">
        <div className="flex items-center gap-sm text-text-1 font-bold tracking-[0.12em] uppercase text-body-sm">
          <AnomaloMark size={16} className="text-accent" decorative={false} />
          ERP Anômalo
        </div>
        {children}
      </div>
      <AnomaloMark />
    </div>
  );
}

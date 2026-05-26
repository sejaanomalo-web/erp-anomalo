import { AnomaloMark } from "@/components/brand/AnomaloMark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-md py-2xl">
      <div className="w-full max-w-md flex flex-col gap-2xl">
        <div className="flex items-center gap-2 text-text-1 font-medium text-base">
          <AnomaloMark size={18} className="text-accent" decorative={false} />
          Tato Estofados
        </div>
        {children}
      </div>
    </div>
  );
}

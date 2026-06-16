import { TatoLogo } from "@/components/brand/TatoLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-md py-2xl">
      <div className="w-full max-w-md flex flex-col gap-2xl">
        <div className="flex items-center">
          <TatoLogo height={22} />
        </div>
        {children}
      </div>
    </div>
  );
}

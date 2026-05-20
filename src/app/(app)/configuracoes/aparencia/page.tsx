"use client";

import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function AparenciaPage() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex flex-col gap-2xl max-w-2xl">
      <Hero
        eyebrow="Sistema"
        titulo="Aparência"
        descricao="Dark é o padrão. Light está disponível para quem prefere."
      />
      <Card className="p-lg flex flex-col gap-md">
        <span className="text-label-caps text-text-3">Tema</span>
        <div className="grid grid-cols-2 gap-md">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`p-md text-left border ${theme === "dark" ? "border-[var(--accent-strong)]" : "border-border-thin"} bg-[#000000]`}
          >
            <span className="block text-body-md text-white">Dark</span>
            <span className="block text-body-sm text-[#c7cdd9]">Padrão Anômalo</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`p-md text-left border ${theme === "light" ? "border-[var(--accent-strong)]" : "border-border-thin"} bg-white`}
          >
            <span className="block text-body-md text-black">Light</span>
            <span className="block text-body-sm text-[#5a5a62]">Alternativa</span>
          </button>
        </div>
        <p className="text-body-sm text-text-3">
          Atual: <span className="text-text-1 capitalize">{theme}</span>.
        </p>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => setTheme("dark")}>
            Restaurar padrão
          </Button>
        </div>
      </Card>
    </div>
  );
}

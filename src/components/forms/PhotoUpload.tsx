"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFotoProduto } from "@/lib/storage/upload";
import { useMeuPerfil } from "@/lib/queries/profiles";

interface PhotoUploadProps {
  label: string;
  pasta: "modelo" | "tecido" | "produto";
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string;
  hint?: string;
}

export function PhotoUpload({
  label,
  pasta,
  value,
  onChange,
  className,
  hint,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: profile } = useMeuPerfil();

  async function onSelect(file: File) {
    if (!profile?.empresa_id) {
      setError("Perfil sem empresa vinculada.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const { url } = await uploadFotoProduto({
        file,
        empresaId: profile.empresa_id,
        pasta,
      });
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-xs", className)}>
      <span className="text-label-caps text-text-3">{label}</span>

      {value ? (
        <div className="relative w-full aspect-[4/3] solid-surface overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            aria-label="Remover foto"
            onClick={() => onChange(null)}
            className="absolute top-xs right-xs bg-background/80 backdrop-blur-sm border border-border-medium p-xs text-text-2 hover:text-text-1 transition-colors duration-fast"
          >
            <X size={14} strokeWidth={1.8} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "solid-surface solid-surface-hover w-full aspect-[4/3] flex flex-col items-center justify-center gap-sm text-text-3 hover:text-text-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast",
          )}
        >
          {uploading ? (
            <Loader2 size={20} strokeWidth={1.8} className="animate-spin text-accent" />
          ) : (
            <ImagePlus size={20} strokeWidth={1.8} />
          )}
          <span className="text-body-sm">
            {uploading ? "Enviando…" : "Adicionar foto"}
          </span>
        </button>
      )}

      {hint ? <span className="text-caption text-text-4">{hint}</span> : null}
      {error ? <span className="text-body-sm text-error">{error}</span> : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

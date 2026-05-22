"use client";

import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/client";
import {
  FOTO_PRODUTO_MAX_BYTES,
  FOTO_PRODUTO_MIME_PERMITIDOS,
} from "@/lib/constants";

interface UploadFotoProps {
  file: File;
  empresaId: string;
  pasta: "modelo" | "tecido" | "produto" | "anexo";
  prefix?: string;
}

interface UploadResult {
  url: string;
  path: string;
}

export async function uploadFotoProduto({
  file,
  empresaId,
  pasta,
  prefix = "venda",
}: UploadFotoProps): Promise<UploadResult> {
  if (file.size > FOTO_PRODUTO_MAX_BYTES) {
    throw new Error(
      `Arquivo maior que ${Math.round(FOTO_PRODUTO_MAX_BYTES / 1024 / 1024)}MB.`,
    );
  }
  if (
    !FOTO_PRODUTO_MIME_PERMITIDOS.includes(
      file.type as (typeof FOTO_PRODUTO_MIME_PERMITIDOS)[number],
    )
  ) {
    throw new Error("Formato não suportado. Use JPEG, PNG ou WebP.");
  }

  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${prefix}-${pasta}-${nanoid(10)}.${ext}`;
  const path = `${empresaId}/${pasta}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("produtos")
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from("produtos").getPublicUrl(path);
  return { url: data.publicUrl, path };
}

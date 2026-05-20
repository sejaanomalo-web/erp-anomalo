"use client";

import Papa from "papaparse";

interface ExportarCSVOptions<T> {
  dados: T[];
  colunas: { key: keyof T | string; label: string; format?: (row: T) => string }[];
  nomeArquivo: string;
}

export function exportarCSV<T extends Record<string, unknown>>({
  dados,
  colunas,
  nomeArquivo,
}: ExportarCSVOptions<T>) {
  const linhas = dados.map((item) =>
    colunas.reduce<Record<string, unknown>>((acc, col) => {
      if (col.format) {
        acc[col.label] = col.format(item);
      } else {
        acc[col.label] = item[col.key as keyof T];
      }
      return acc;
    }, {}),
  );

  const csv = Papa.unparse(linhas, { delimiter: ";" });
  // UTF-8 BOM para Excel reconhecer acentos
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const stamp = new Date().toISOString().split("T")[0];
  link.download = `${nomeArquivo}-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================
// Período global do sistema — Mês / Dia / Intervalo.
//
// O estado vive na URL (searchParams: ?modo&de&ate&mes&ano), então
// é compartilhável, sobrevive a reload e qualquer página (server ou
// client) deriva o mesmo Periodo via parsePeriodo(). Datas sempre em
// YYYY-MM-DD inclusivas. Ano fiscal completo (Janeiro a Dezembro).
// ============================================================

export type ModoPeriodo = "mes" | "dia" | "intervalo";

export interface Periodo {
  modo: ModoPeriodo;
  /** Início inclusivo (YYYY-MM-DD). */
  de: string;
  /** Fim inclusivo (YYYY-MM-DD). */
  ate: string;
  /** Mês derivado do início (1-12). */
  mes: number;
  /** Ano derivado do início. */
  ano: number;
  /** Rótulo legível ("Junho 2026", "12 jun 2026", "01 a 15 jun 2026"). */
  rotulo: string;
}

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

const MESES_CURTOS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function mesAtual(): number {
  return new Date().getMonth() + 1;
}

export function anoAtual(): number {
  return new Date().getFullYear();
}

export const ANOS_DISPONIVEIS: number[] = (() => {
  const atual = anoAtual();
  const inicio = Math.min(atual, 2026);
  const fim = atual + 2;
  const anos: number[] = [];
  for (let y = inicio; y <= fim; y++) anos.push(y);
  return anos;
})();

/** Hoje no fuso do dispositivo, em YYYY-MM-DD. */
export function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Primeiro e último dia de um mês (1-12) como intervalo fechado ISO. */
export function rangeDoMes(mes: number, ano: number): { de: string; ate: string } {
  const ultimoDia = new Date(ano, mes, 0).getDate();
  return {
    de: `${ano}-${pad(mes)}-01`,
    ate: `${ano}-${pad(mes)}-${pad(ultimoDia)}`,
  };
}

function isoValido(s: string | null): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function parseAno(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 2020 && n <= 2100 ? n : null;
}

/** Aceita "Junho", "junho" ou "6"; devolve 1-12 ou null. */
function parseMes(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  if (Number.isInteger(n) && n >= 1 && n <= 12) return n;
  const idx = MESES.findIndex(
    (m) => m.toLowerCase() === v.trim().toLowerCase(),
  );
  return idx >= 0 ? idx + 1 : null;
}

function rotuloDia(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${pad(d)} ${MESES_CURTOS[m - 1]} ${y}`;
}

function rotuloIntervalo(de: string, ate: string): string {
  const [, , dDe] = de.split("-").map(Number);
  const [yA, mA, dA] = ate.split("-").map(Number);
  const [, mDe] = de.split("-").map(Number);
  const inicio =
    mDe === mA
      ? `${pad(dDe)}`
      : `${pad(dDe)} ${MESES_CURTOS[mDe - 1]}`;
  return `${inicio} a ${pad(dA)} ${MESES_CURTOS[mA - 1]} ${yA}`;
}

interface ParamsLike {
  get(key: string): string | null;
}

/** Deriva o Periodo a partir dos searchParams (client ou server). */
export function parsePeriodo(params: ParamsLike): Periodo {
  const modoRaw = params.get("modo");
  const modo: ModoPeriodo =
    modoRaw === "dia" || modoRaw === "intervalo" ? modoRaw : "mes";

  if (modo === "dia") {
    const de = isoValido(params.get("de")) ? params.get("de")! : hojeISO();
    const [y, m] = de.split("-").map(Number);
    return { modo, de, ate: de, mes: m, ano: y, rotulo: rotuloDia(de) };
  }

  if (modo === "intervalo") {
    const padraoMes = rangeDoMes(mesAtual(), anoAtual());
    let de = isoValido(params.get("de")) ? params.get("de")! : padraoMes.de;
    let ate = isoValido(params.get("ate")) ? params.get("ate")! : padraoMes.ate;
    if (de > ate) [de, ate] = [ate, de];
    const [y, m] = de.split("-").map(Number);
    return { modo, de, ate, mes: m, ano: y, rotulo: rotuloIntervalo(de, ate) };
  }

  const ano = parseAno(params.get("ano")) ?? anoAtual();
  const mes = parseMes(params.get("mes")) ?? mesAtual();
  const { de, ate } = rangeDoMes(mes, ano);
  return { modo: "mes", de, ate, mes, ano, rotulo: `${MESES[mes - 1]} ${ano}` };
}

/** Constrói os searchParams a partir de um Periodo (para montar URLs). */
export function periodoParaParams(p: Periodo): URLSearchParams {
  const sp = new URLSearchParams();
  sp.set("modo", p.modo);
  if (p.modo === "mes") {
    sp.set("mes", MESES[p.mes - 1]);
    sp.set("ano", String(p.ano));
  } else if (p.modo === "dia") {
    sp.set("de", p.de);
  } else {
    sp.set("de", p.de);
    sp.set("ate", p.ate);
  }
  return sp;
}

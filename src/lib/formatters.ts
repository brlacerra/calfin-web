export function formatMoney(val: number): string {
  if (!Number.isFinite(val)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatPercent(val: number, decimals = 4): string {
  if (!Number.isFinite(val)) return "0,0000%";
  return (
    new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(val * 100) + "%"
  );
}

export function formatNumber(val: number, decimals = 6): string {
  if (!Number.isFinite(val)) return "0";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function parseBRNumber(val: string): number {
  if (!val) return NaN;
  const cleaned = val.replace(/\s+/g, "").replace(/\./g, "").replace(",", ".");
  return Number(cleaned);
}

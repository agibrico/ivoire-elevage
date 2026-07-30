export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + " FCFA";
}

export function formatFCFADecimal(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + " FCFA";
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("fr-FR").format(num);
}

export function formatPercent(val: number): string {
  return val.toFixed(1) + "%";
}

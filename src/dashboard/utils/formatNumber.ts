const numberFormatter = new Intl.NumberFormat("ko-KR");

export function formatNumber(value: number | undefined | null) {
  if (value == null || Number.isNaN(value)) return "–";
  return numberFormatter.format(value);
}


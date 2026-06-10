const CRORE = 10_000_000;
const LAKH = 100_000;

function trimDecimals(value: number, decimals: number): string {
  const factor = 10 ** decimals;
  return (Math.floor(value * factor) / factor).toString();
}

export function formatInr(rupees: number): string {
  const n = Math.round(rupees);
  const sign = n < 0 ? "-" : "";
  return `${sign}₹${Math.abs(n).toLocaleString("en-IN")}`;
}

/** Compact Cr/L notation for large amounts in chart centers and legends. */
export function formatInrCompact(rupees: number): string {
  const n = Math.round(rupees);
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  if (abs < CRORE) {
    return formatInr(n);
  }

  const crores = Math.floor(abs / CRORE);
  const remainder = abs % CRORE;
  const crorePart = `${crores}Cr`;

  if (remainder === 0) {
    return `${sign}₹${crorePart}`;
  }

  const lakhs = remainder / LAKH;
  const lakhPart = lakhs % 1 === 0 ? String(Math.round(lakhs)) : trimDecimals(lakhs, 2);

  return `${sign}₹${crorePart} ${lakhPart}L`;
}

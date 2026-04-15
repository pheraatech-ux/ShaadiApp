export function toInr(paise: number) {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

export function toInrCompact(paise: number) {
  const rupees = paise / 100;
  if (rupees >= 100000) {
    return `₹${(rupees / 100000).toLocaleString("en-IN", { maximumFractionDigits: 1 })}L`;
  }
  return `₹${Math.round(rupees).toLocaleString("en-IN")}`;
}

export function toPct(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

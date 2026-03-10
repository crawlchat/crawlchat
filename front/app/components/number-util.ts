export function numberToKMB(num: number, toFixed?: number) {
  const prefix = num < 0 ? "-" : "";
  num = Math.abs(num);
  if (num < 1000) return `${prefix}${toFixed ? num.toFixed(toFixed) : num}`;
  if (num < 1000000) return `${prefix}${(num / 1000).toFixed(1)}k`;
  return `${prefix}${(num / 1000000).toFixed(1)}M`;
}

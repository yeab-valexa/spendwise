export interface CurrencyInfo {
  symbol: string;
  name: string;
  words: string[]; // the words people actually type for this currency
}

export const DEFAULT_CURRENCY = "ETB";

export const CURRENCIES: Record<string, CurrencyInfo> = {
  ETB: { symbol: "Br", name: "Birr", words: ["birr", "br", "etb", "bir"] },
  USD: { symbol: "$", name: "US Dollar", words: ["usd", "dollar", "dollars", "$", "buck", "bucks"] },
  EUR: { symbol: "€", name: "Euro", words: ["eur", "euro", "euros", "€"] },
  GBP: { symbol: "£", name: "Pound", words: ["gbp", "pound", "pounds", "£"] },
  AED: { symbol: "AED", name: "Dirham", words: ["aed", "dirham", "dirhams"] },
  SAR: { symbol: "SAR", name: "Riyal", words: ["sar", "riyal", "riyals"] },
  KES: { symbol: "KSh", name: "Shilling", words: ["kes", "ksh", "shilling", "shillings"] },
};

export const WORD_TO_CURRENCY: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const [code, info] of Object.entries(CURRENCIES)) {
    map[code.toLowerCase()] = code;
    for (const w of info.words) map[w] = code;
  }
  return map;
})();

const fmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number, currency: string): string {
  const info = CURRENCIES[currency];
  const sym = info ? info.symbol : currency;
  const n = fmt.format(amount);
  return sym.length === 1 ? `${sym}${n}` : `${sym} ${n}`;
}

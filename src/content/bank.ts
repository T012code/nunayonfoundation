// Bank account details for donations, by currency. Each currency asks for what senders in
// that currency conventionally need:
// - NGN: bank, account name and the 10-digit (NUBAN) account number.
// - USD: beneficiary name, bank, account number and SWIFT/BIC; a routing (ABA) number for
//   accounts held in the US; for Nigerian domiciliary accounts, the bank's address and its US
//   correspondent (intermediary) bank, which the bank's international desk provides.
// - GBP: account name, bank, account number and a sort code for UK accounts; IBAN and
//   SWIFT/BIC for payments from abroad; correspondent bank for Nigerian domiciliary accounts.
// - EUR: account name, bank, IBAN and SWIFT/BIC.

export const CURRENCIES = ["NGN", "USD", "GBP", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export type BankAccount = {
  currency: Currency;
  bank: string;
  name: string;
  number: string;
  sortCode?: string;
  iban?: string;
  swift?: string;
  routing?: string;
  bankAddress?: string;
  intermediaryBank?: string;
  intermediarySwift?: string;
  intermediaryAccount?: string;
};

export type BankField = {
  key: Exclude<keyof BankAccount, "currency">;
  label: string;
  help?: string;
  required?: boolean;
  /** Shown large with a copy button on the site. */
  copy?: boolean;
  /** Details most senders won't need; grouped under "From abroad" or "Correspondent bank". */
  group?: "abroad" | "correspondent";
};

const BASE: BankField[] = [
  { key: "bank", label: "Bank", required: true },
  { key: "name", label: "Account name", required: true },
];
const CORRESPONDENT: BankField[] = [
  { key: "intermediaryBank", label: "Correspondent bank", help: "Only for Nigerian domiciliary accounts; your bank's international desk gives these.", group: "correspondent" },
  { key: "intermediarySwift", label: "Correspondent SWIFT/BIC", group: "correspondent", copy: true },
  { key: "intermediaryAccount", label: "Correspondent account number", group: "correspondent", copy: true },
];

export const BANK_FIELDS: Record<Currency, BankField[]> = {
  NGN: [...BASE, { key: "number", label: "Account number", required: true, copy: true, help: "10 digits (NUBAN)." }],
  USD: [
    ...BASE,
    { key: "number", label: "Account number", required: true, copy: true },
    { key: "swift", label: "SWIFT/BIC", required: true, copy: true, help: "8 or 11 characters." },
    { key: "routing", label: "Routing number (ABA)", copy: true, help: "Only for accounts held in the US. 9 digits." },
    { key: "bankAddress", label: "Bank address", group: "abroad" },
    ...CORRESPONDENT,
  ],
  GBP: [
    ...BASE,
    { key: "number", label: "Account number", required: true, copy: true },
    { key: "sortCode", label: "Sort code", copy: true, help: "Only for accounts held in the UK. 6 digits, e.g. 20-00-00." },
    { key: "iban", label: "IBAN", copy: true, group: "abroad", help: "For payments from outside the UK." },
    { key: "swift", label: "SWIFT/BIC", copy: true, group: "abroad" },
    { key: "bankAddress", label: "Bank address", group: "abroad" },
    ...CORRESPONDENT,
  ],
  EUR: [
    ...BASE,
    { key: "iban", label: "IBAN", required: true, copy: true },
    { key: "swift", label: "SWIFT/BIC", required: true, copy: true },
    { key: "number", label: "Account number", copy: true, help: "Optional; most euro payments only need the IBAN." },
    { key: "bankAddress", label: "Bank address", group: "abroad" },
    ...CORRESPONDENT,
  ],
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  NGN: "Naira (NGN)",
  USD: "US dollar (USD)",
  GBP: "Pound sterling (GBP)",
  EUR: "Euro (EUR)",
};

/** Problems with one account, in plain words (empty when it's fine). */
export function bankProblems(a: BankAccount): string[] {
  const out: string[] = [];
  const fields = BANK_FIELDS[a.currency];
  for (const f of fields) if (f.required && !a[f.key]?.trim()) out.push(`${f.label} is needed`);
  const digits = (v?: string) => (v ?? "").replace(/[\s-]/g, "");
  if (a.currency === "NGN" && a.number && !/^\d{10}$/.test(digits(a.number))) out.push("a naira account number has 10 digits");
  if (a.sortCode && !/^\d{6}$/.test(digits(a.sortCode))) out.push("a sort code has 6 digits");
  if (a.routing && !/^\d{9}$/.test(digits(a.routing))) out.push("a routing number has 9 digits");
  for (const k of ["swift", "intermediarySwift"] as const) {
    if (a[k] && !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(digits(a[k]))) out.push("a SWIFT/BIC code has 8 or 11 letters and numbers");
  }
  if (a.iban && !/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/i.test(digits(a.iban))) out.push("an IBAN starts with two letters and two numbers");
  return [...new Set(out)];
}

/** Keeps only the fields this currency uses, trimmed (and codes in capitals). */
export function cleanAccount(raw: Partial<BankAccount>): BankAccount {
  const currency = CURRENCIES.includes(raw.currency as Currency) ? (raw.currency as Currency) : "NGN";
  const out: BankAccount = { currency, bank: "", name: "", number: "" };
  for (const f of BANK_FIELDS[currency]) {
    let v = String(raw[f.key] ?? "").trim().slice(0, 200);
    if (["swift", "intermediarySwift", "iban"].includes(f.key)) v = v.replace(/\s+/g, "").toUpperCase();
    if (v) out[f.key] = v;
  }
  return out;
}

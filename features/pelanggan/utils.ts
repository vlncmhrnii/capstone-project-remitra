import type {
  CategoryLabel,
  Customer,
  CustomerSummary,
  Transaction,
} from "./types";

export function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}

export function formatShortDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function getCustomerCategory(skor: number): CategoryLabel {
  if (skor <= 0) return "Green";
  if (skor <= 7) return "Yellow";
  if (skor <= 30) return "Red";
  return "Black";
}

export function normalizeCategoryLabel(value?: string | null): CategoryLabel {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "green") return "Green";
  if (normalized === "yellow") return "Yellow";
  if (normalized === "red") return "Red";
  if (normalized === "black") return "Black";
  return "Green";
}

export function computeCustomerSummary(
  customer: Customer,
  transactions: Transaction[],
  currentDate: string,
): CustomerSummary {
  const totalKasbon = transactions
    .filter((item) => item.type === "kasbon")
    .reduce((sum, item) => sum + item.nominal, 0);
  const totalBayar = transactions
    .filter((item) => item.type === "bayar")
    .reduce((sum, item) => sum + item.nominal, 0);
  const sisaUtang = Math.max(totalKasbon - totalBayar, 0);
  const janjiBayar = transactions
    .filter((item) => item.tanggalJanji)
    .sort(
      (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(),
    )[0]?.tanggalJanji;
  const overdueDays = janjiBayar
    ? Math.floor(
        (new Date(currentDate).getTime() - new Date(janjiBayar).getTime()) /
          86400000,
      )
    : 0;

  return {
    totalKasbon,
    totalBayar,
    sisaUtang,
    janjiBayar,
    overdueDays: Math.max(overdueDays, 0),
    isJatuhTempo: Boolean(janjiBayar) && overdueDays > 0 && sisaUtang > 0,
    kategori:
      sisaUtang <= 0 ? "Green" : getCustomerCategory(customer.skor_keterlambatan ?? 0),
  };
}

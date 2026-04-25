import type {
  BayarForm,
  CategoryLabel,
  CustomerForm,
  KasbonForm,
} from "./types";

export const today = new Date().toISOString().slice(0, 10);

export const categoryMeta: Record<CategoryLabel, string> = {
  Green:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  Yellow:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  Red: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  Black:
    "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200",
};

export const emptyCustomerForm: CustomerForm = {
  nama: "",
  no_hp: "",
  alamat: "",
};

export const emptyKasbonForm: KasbonForm = {
  nominal: "",
  tanggalKasbon: today,
  tanggalJanji: "",
  target: "lunas",
  keterangan: "",
};

export const emptyBayarForm: BayarForm = {
  jenis: "lunas",
  nominal: "",
  tanggalBayar: today,
  keterangan: "",
};

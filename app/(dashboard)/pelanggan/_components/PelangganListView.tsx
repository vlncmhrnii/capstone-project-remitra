"use client";

import type { ChangeEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon,
  UsersIcon,
  WalletIcon,
} from "@heroicons/react/24/solid";

import { AvatarAny, ButtonAny, InputAny } from "./ui-adapters";
import { categoryMeta, today } from "@/features/pelanggan/constants";
import { computeCustomerSummary, formatRupiah } from "@/features/pelanggan/utils";
import type { Customer, Transaction } from "@/features/pelanggan/types";

type PelangganListViewProps = {
  customers: Customer[];
  transactions: Transaction[];
  query: string;
  onQueryChange: (value: string) => void;
  onCreate: () => void;
  onSelectCustomer: (customerId: string) => void;
};

export default function PelangganListView({
  customers,
  transactions,
  query,
  onQueryChange,
  onCreate,
  onSelectCustomer,
}: PelangganListViewProps) {
  const totalOutstanding = customers.reduce((sum, customer) => {
    const customerTransactions = transactions.filter(
      (item) => item.customerId === customer.id,
    );
    const summary = computeCustomerSummary(customer, customerTransactions, today);
    return sum + summary.sisaUtang;
  }, 0);

  const overdueCount = customers.filter((customer) => {
    const customerTransactions = transactions.filter(
      (item) => item.customerId === customer.id,
    );
    const summary = computeCustomerSummary(customer, customerTransactions, today);
    return summary.overdueDays > 0 && summary.sisaUtang > 0;
  }).length;

  return (
    <section className="relative overflow-hidden rounded-4xl border border-neutral-200 bg-neutral-50 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.35)] dark:border-neutral-800 dark:bg-neutral-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-orange-400/15 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute right-0 top-12 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-400/10" />
      </div>

      <div className="relative border-b border-white/70 bg-white/70 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/70 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              Semua Pelanggan
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight text-neutral-950 dark:text-white sm:text-5xl">
                Kelola pelanggan dan catatan piutang dengan lebih rapi
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 sm:text-base">
                Pantau saldo, status pembayaran, dan riwayat transaksi pelanggan dalam satu tempat yang mudah digunakan setiap hari.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:min-w-65">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-3xl border border-neutral-200 bg-white/90 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/90">
                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <UsersIcon className="h-4 w-4" aria-hidden="true" />
                  Total Pelanggan
                </div>
                <p className="mt-2 text-3xl font-black text-neutral-950 dark:text-white">{customers.length}</p>
              </div>
              <div className="rounded-3xl border border-neutral-200 bg-white/90 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/90">
                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <WalletIcon className="h-4 w-4" aria-hidden="true" />
                  Total Kasbon
                </div>
                <p className="mt-2 text-xl font-black text-orange-600 dark:text-orange-400">{formatRupiah(totalOutstanding)}</p>
              </div>
              <div className="rounded-3xl border border-neutral-200 bg-white/90 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/90">
                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                  Perlu Follow Up
                </div>
                <p className="mt-2 text-3xl font-black text-neutral-950 dark:text-white">{overdueCount}</p>
              </div>
            </div>

            <ButtonAny text="Tambah Pelanggan" leftIcon={PlusIcon} size="medium" onClick={onCreate} className="w-full" />
          </div>
        </div>
      </div>

      <div className="relative p-5 sm:p-6 lg:p-7">
        <div className="space-y-4">
          <div className="rounded-3xl border border-neutral-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
            <InputAny
              label="Cari pelanggan"
              placeholder="Cari nama atau nomor HP..."
              leftIcon={MagnifyingGlassIcon}
              size="medium"
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) => onQueryChange(event.target.value)}
              className="gap-0"
              inputClassName="text-sm"
              helperText="Masukkan nama atau nomor HP pelanggan untuk mencari."
            />
          </div>

          <div className="grid gap-3">
            {customers.length > 0 ? (
              customers.map((customer, index) => {
                const customerTransactions = transactions.filter(
                  (item) => item.customerId === customer.id,
                );
                const summary = computeCustomerSummary(
                  customer,
                  customerTransactions,
                  today,
                );
                const isOverdue = summary.overdueDays > 0 && summary.sisaUtang > 0;
                const gradientClass = isOverdue
                  ? "from-rose-500/10 via-white to-white dark:from-rose-500/10 dark:via-neutral-950 dark:to-neutral-950"
                  : "from-orange-500/10 via-white to-white dark:from-orange-500/10 dark:via-neutral-950 dark:to-neutral-950";

                return (
                  <motion.button
                    key={customer.id}
                    type="button"
                    onClick={() => onSelectCustomer(customer.id)}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.25), duration: 0.35 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`group relative overflow-hidden rounded-3xl border border-neutral-200 bg-linear-to-br p-4 text-left shadow-[0_16px_40px_-28px_rgba(0,0,0,0.45)] transition dark:border-neutral-800 ${gradientClass}`}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-orange-400 via-amber-400 to-transparent opacity-80" />
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <AvatarAny name={customer.nama} alt={customer.nama} initials={customer.nama} size="h3" src="" />
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-black tracking-tight text-neutral-950 dark:text-white">{customer.nama}</h3>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${categoryMeta[summary.kategori]}`}>{summary.kategori}</span>
                          </div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">{customer.no_hp || "-"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Sisa utang</p>
                          <p className="mt-1 text-2xl font-black tracking-tight text-neutral-950 dark:text-white">{formatRupiah(summary.sisaUtang)}</p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-2 text-xs font-semibold text-neutral-600 shadow-sm transition group-hover:border-orange-200 group-hover:text-orange-600 dark:border-neutral-800 dark:bg-neutral-950/90 dark:text-neutral-300 dark:group-hover:border-orange-500/20 dark:group-hover:text-orange-300">
                          Lihat Detail
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/80 p-8 text-center dark:border-neutral-700 dark:bg-neutral-950/80">
                <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Tidak ada pelanggan ditemukan.</p>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Coba ubah kata kunci pencarian atau tambahkan pelanggan baru.</p>
                <div className="mt-4 flex justify-center">
                  <ButtonAny text="Tambah Pelanggan" leftIcon={PlusIcon} onClick={onCreate} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

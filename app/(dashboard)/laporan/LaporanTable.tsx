"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

import type { Transaction } from "@/features/pelanggan/types";

type LaporanView = "semua" | "belum_lunas" | "lunas";

type Props = {
  data: Transaction[];
  view: LaporanView;
};

type GroupedTransaction = {
  customerId: string;
  nama: string;
  no_hp: string;
  transaksi: Transaction[];
};

const CARDS_PER_PAGE = 5;

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const fmtRupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

const isLewat = (d: string) =>
  new Date(d) < new Date(new Date().toISOString().split("T")[0]);

function pickDisplayValue(...values: Array<string | undefined>) {
  return values.find((value) => {
    const normalized = value?.trim();
    return Boolean(normalized && normalized !== "-");
  });
}

function StatusBadge({ status, target }: { status?: string; target?: string }) {
  if (status === "lunas") {
    return (
      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
        Lunas
      </span>
    );
  }

  if (status === "cicilan" || target === "cicil") {
    return (
      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
        Cicilan
      </span>
    );
  }

  return (
    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
      Belum Lunas
    </span>
  );
}

function summarizeTransactions(transactions: Transaction[]) {
  const totalKasbon = transactions
    .filter((transaction) => transaction.type === "kasbon")
    .reduce((sum, transaction) => sum + transaction.nominal, 0);
  const totalBayar = transactions
    .filter((transaction) => transaction.type === "bayar")
    .reduce((sum, transaction) => sum + transaction.nominal, 0);

  return {
    totalKasbon,
    totalBayar,
    sisaUtang: Math.max(totalKasbon - totalBayar, 0),
  };
}

function getTransactionLabel(transaction: Transaction) {
  return transaction.type === "kasbon" ? "Kasbon" : "Bayar";
}

function getSummaryBadge(
  summary: ReturnType<typeof summarizeTransactions>,
  hasOverdue: boolean,
) {
  if (summary.sisaUtang <= 0) {
    return {
      label: "Tuntas",
      className: "bg-green-100 text-green-700",
    };
  }

  if (hasOverdue) {
    return {
      label: "Lewat Tempo",
      className: "bg-red-100 text-red-600",
    };
  }

  return {
    label: "Berjalan",
    className: "bg-orange-100 text-orange-700",
  };
}

export default function LaporanTable({ data, view }: Props) {
  const [page, setPage] = useState(0);

  const grouped = data.reduce<Record<string, GroupedTransaction>>((acc, row) => {
    const key = row.customerId || `unknown-${row.id}`;

    if (!acc[key]) {
      acc[key] = {
        customerId: key,
        nama: pickDisplayValue(row.nama) ?? "",
        no_hp: pickDisplayValue(row.no_hp) ?? "",
        transaksi: [],
      };
    }

    acc[key].nama = pickDisplayValue(acc[key].nama, row.nama) ?? "";
    acc[key].no_hp = pickDisplayValue(acc[key].no_hp, row.no_hp) ?? "";
    acc[key].transaksi.push(row);
    return acc;
  }, {});

  const groups = Object.values(grouped);
  const totalPages = Math.ceil(groups.length / CARDS_PER_PAGE);
  const safePage = totalPages === 0 ? 0 : Math.min(page, totalPages - 1);
  const pagedGroups = groups.slice(
    safePage * CARDS_PER_PAGE,
    safePage * CARDS_PER_PAGE + CARDS_PER_PAGE,
  );

  if (groups.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-neutral-400">
        Tidak ada data
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {pagedGroups.map((group, index) => {
        const displayIndex = safePage * CARDS_PER_PAGE + index;
        const summary = summarizeTransactions(group.transaksi);
        const adaLewat = group.transaksi.some((transaction) => {
          return (
            transaction.tanggalJanji &&
            isLewat(transaction.tanggalJanji) &&
            transaction.status !== "lunas"
          );
        });
        const displayName = group.nama || `Pelanggan #${displayIndex + 1}`;
        const displayPhone = group.no_hp || "Data kontak tidak tersedia";
        const avatarLabel = displayName.slice(0, 1).toUpperCase() || "?";
        const summaryBadge = getSummaryBadge(summary, adaLewat);
        const isSettledGroup = summary.sisaUtang <= 0;
        const useLunasLayout = view === "lunas" || isSettledGroup;

        return (
          <div
            key={group.customerId}
            className="overflow-hidden rounded-2xl border border-orange-100 bg-white/95 shadow-sm dark:border-orange-900 dark:bg-neutral-900/90"
          >
            <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50/80 px-5 py-3.5 dark:border-orange-900 dark:bg-orange-950/30">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                  {avatarLabel}
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {displayName}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {displayPhone}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${summaryBadge.className}`}>
                  {summaryBadge.label}
                </span>
                <p className="mt-2 text-xs text-neutral-400">Sisa Utang</p>
                <p className="text-sm font-extrabold text-orange-600">
                  {fmtRupiah(summary.sisaUtang)}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {group.transaksi.length} transaksi
                </p>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-orange-50 text-xs text-neutral-400 dark:border-orange-900">
                  <th className="px-5 py-2 text-left font-medium">Tanggal</th>
                  <th className="px-5 py-2 text-left font-medium">Jenis</th>
                  <th className="px-5 py-2 text-left font-medium">Jumlah</th>
                  {!useLunasLayout ? (
                    <th className="px-5 py-2 text-left font-medium">Jatuh Tempo</th>
                  ) : null}
                  {!useLunasLayout ? (
                    <th className="px-5 py-2 text-left font-medium">Status</th>
                  ) : null}
                  <th className="px-5 py-2 text-left font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50 dark:divide-orange-900/50">
                {group.transaksi.map((transaction, indexRow) => (
                  <tr
                    key={`${transaction.id}-${indexRow}`}
                    className="transition hover:bg-orange-50/40 dark:hover:bg-orange-950/10"
                  >
                    <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">
                      {transaction.tanggal ? fmtDate(transaction.tanggal) : "-"}
                    </td>

                    <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">
                      {getTransactionLabel(transaction)}
                    </td>

                    <td className="px-5 py-3 font-bold text-orange-700 dark:text-orange-300">
                      {fmtRupiah(transaction.nominal)}
                    </td>

                    {!useLunasLayout ? (
                      <td className="px-5 py-3">
                        {transaction.tanggalJanji ? (
                          <span
                            className={
                              isLewat(transaction.tanggalJanji) &&
                              transaction.status !== "lunas"
                                ? "font-semibold text-red-500"
                                : "text-neutral-600 dark:text-neutral-300"
                            }
                          >
                            {fmtDate(transaction.tanggalJanji)}
                            {isLewat(transaction.tanggalJanji) &&
                              transaction.status !== "lunas" &&
                              " (lewat)"}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    ) : null}

                    {!useLunasLayout ? (
                      <td className="px-5 py-3">
                        <StatusBadge
                          status={transaction.status}
                          target={transaction.target}
                        />
                      </td>
                    ) : null}

                    <td className="px-5 py-3 text-neutral-500 dark:text-neutral-400">
                      {transaction.keterangan ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between rounded-2xl border border-orange-200 bg-white/95 px-4 py-3 dark:border-orange-900 dark:bg-neutral-900/90">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            disabled={safePage === 0}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-orange-700 transition enabled:hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-orange-200 dark:enabled:hover:bg-orange-500/20"
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            Prev
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={`laporan-page-${index}`}
                type="button"
                suppressHydrationWarning
                onClick={() => setPage(index)}
                aria-label={`Halaman laporan ${index + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  safePage === index
                    ? "w-6 bg-orange-500"
                    : "w-2.5 bg-orange-200 dark:bg-orange-700"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))}
            disabled={safePage >= totalPages - 1}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-orange-700 transition enabled:hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-orange-200 dark:enabled:hover:bg-orange-500/20"
          >
            Next
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

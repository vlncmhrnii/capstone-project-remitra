import {
	ArrowLeftIcon,
	CalendarDaysIcon,
	ChatBubbleLeftRightIcon,
	PencilSquareIcon,
	PlusIcon,
	TrashIcon,
	WalletIcon,
} from "@heroicons/react/24/solid";

import { AvatarAny, ButtonAny } from "./ui-adapters";
import Modal from "@/components/modal/Modal";
import { categoryMeta } from "@/features/pelanggan/constants";
import { formatRupiah, formatShortDate } from "@/features/pelanggan/utils";
import type {
	Customer,
	CustomerSummary,
	Transaction,
} from "@/features/pelanggan/types";
import type { ComponentType } from "react";
import { useState } from "react";

type PelangganDetailViewProps = {
	customer: Customer;
	summary: CustomerSummary;
	transactions: Transaction[];
	onBack: () => void;
	onOpenKasbon: () => void;
	onOpenBayar: () => void;
	onOpenEdit: () => void;
	onOpenDelete: () => void;
	onTagihWA: () => void;
	terakhirDitagih: string | null;
};

export default function PelangganDetailView({
	customer,
	summary,
	transactions,
	onBack,
	onOpenKasbon,
	onOpenBayar,
	onOpenEdit,
	onOpenDelete,
	onTagihWA,        // ← tambah ini
  	terakhirDitagih,  // ← tambah ini
}: PelangganDetailViewProps) {
	const ModalAny = Modal as unknown as ComponentType<Record<string, unknown>>;
	const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

	return (
		<section className="overflow-hidden rounded-4xl border border-neutral-200 bg-white shadow-[0_24px_80px_-48px_rgba(0,0,0,0.35)] dark:border-neutral-800 dark:bg-neutral-950">
			<div className="relative overflow-hidden border-b border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-6 lg:p-7">
				<div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-orange-400/15 blur-3xl dark:bg-orange-500/10" />
				<div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2 sm:right-6 sm:top-6 lg:right-7 lg:top-7">
					<div className="flex items-center gap-2">
						<ButtonAny iconOnly icon={PencilSquareIcon} size="small" onClick={onOpenEdit} aria-label="Edit pelanggan" title="Edit pelanggan" />
						<ButtonAny iconOnly icon={TrashIcon} variant="delete" size="small" onClick={onOpenDelete} aria-label="Hapus pelanggan" title="Hapus pelanggan" />
					</div>
					{summary.isJatuhTempo ? (
						<div className="mt-5 flex flex-col gap-2 items-end">
							<ButtonAny
								text="Tagih via WA"
								leftIcon={ChatBubbleLeftRightIcon}
								variant="secondary"
								size="small"
								onClick={onTagihWA}
							/>
							<span className="text-xs text-neutral-500 dark:text-neutral-400">
								Terakhir ditagih: {terakhirDitagih ? new Date(terakhirDitagih).toLocaleDateString("id-ID") : "Belum pernah"}
							</span>
						</div>
					) : null}
				</div>
				<div className="flex flex-col gap-4 pt-14 sm:pt-0">
					<button type="button" onClick={onBack} className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:border-orange-200 hover:text-orange-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:border-orange-500/20 dark:hover:text-orange-300">
						<ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
						Kembali ke daftar
					</button>

					<div className="flex items-start gap-3 sm:gap-4">
						<AvatarAny name={customer.nama} alt={customer.nama} initials={customer.nama} size="h2" src="" />
						<div className="space-y-2">
							<div className="flex flex-wrap items-center gap-2">
								<h1 className="text-3xl font-black tracking-tight text-neutral-950 dark:text-white sm:text-4xl">{customer.nama}</h1>
								<span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${categoryMeta[summary.kategori]}`}>
									{summary.kategori}
								</span>
							</div>
							<p className="text-sm text-neutral-500 dark:text-neutral-400">{customer.no_hp || "-"}</p>
							<p className="max-w-xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 sm:pr-20">
								Detail lengkap pelanggan, histori transaksi, dan tindakan cepat untuk tagih, kasbon, atau bayar.
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="p-5 sm:p-6 lg:p-7">
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
						<div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
							<WalletIcon className="h-5 w-5" aria-hidden="true" />
							Sisa Utang
						</div>
						<p className="mt-3 text-3xl font-black text-neutral-950 dark:text-white">{formatRupiah(summary.sisaUtang)}</p>
						<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">dari total {formatRupiah(summary.totalKasbon)}</p>
					</div>

					<div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
						<div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
							<CalendarDaysIcon className="h-5 w-5" aria-hidden="true" />
							Janji Bayar
						</div>
						<p className="mt-3 text-3xl font-black text-neutral-950 dark:text-white">{formatShortDate(summary.janjiBayar)}</p>
						<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{summary.isJatuhTempo ? `Telat ${summary.overdueDays} hari` : "Belum jatuh tempo"}</p>
					</div>

					<div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
						<div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
							<PlusIcon className="h-5 w-5" aria-hidden="true" />
							Total Kasbon
						</div>
						<p className="mt-3 text-3xl font-black text-neutral-950 dark:text-white">{formatRupiah(summary.totalKasbon)}</p>
						<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{transactions.filter((item) => item.type === "kasbon").length} transaksi kasbon</p>
					</div>

					<div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
						<div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
							<ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden="true" />
							Total Bayar
						</div>
						<p className="mt-3 text-3xl font-black text-neutral-950 dark:text-white">{formatRupiah(summary.totalBayar)}</p>
						<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{transactions.filter((item) => item.type === "bayar").length} transaksi bayar</p>
					</div>
				</div>

				<div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
					<ButtonAny text="Kasbon" leftIcon={PlusIcon} variant="secondary" size="large" onClick={onOpenKasbon} />
					<ButtonAny text="Bayar" leftIcon={PlusIcon} size="large" onClick={onOpenBayar} />
				</div>

				<section className="mt-5 rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
					<div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
						<div>
							<h2 className="text-xl font-black text-neutral-950 dark:text-white">Riwayat Transaksi</h2>
							<p className="text-sm text-neutral-500 dark:text-neutral-400">Urutan terbaru muncul paling atas.</p>
						</div>
						<span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
							{transactions.length} transaksi
						</span>
					</div>
					<div className="divide-y divide-neutral-200 dark:divide-neutral-800">
						{transactions.length > 0 ? (
							transactions.map((item) => (
								<button key={item.id} type="button" onClick={() => setSelectedTransaction(item)} className="w-full flex flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between transition hover:bg-neutral-50 dark:hover:bg-neutral-900/50 text-left">
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${item.type === "kasbon" ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"}`}>
												{item.type === "kasbon" ? "Kasbon" : "Bayar"}
											</span>
											<p className="font-semibold text-neutral-950 dark:text-white">{item.type === "kasbon" ? "Kasbon Baru" : "Pembayaran"}</p>
										</div>
										<p className="text-sm text-neutral-500 dark:text-neutral-400">
											{formatShortDate(item.tanggal)}
											{item.keterangan ? ` · ${item.keterangan}` : ""}
										</p>
									</div>
									<p className={`text-lg font-black ${item.type === "kasbon" ? "text-rose-500" : "text-emerald-500"}`}>
										{item.type === "kasbon" ? "+" : "-"} {formatRupiah(item.nominal)}
									</p>
								</button>
							))
						) : (
							<p className="px-5 py-6 text-sm text-neutral-500 dark:text-neutral-400">Belum ada transaksi.</p>
						)}
					</div>
				</section>

				{selectedTransaction && (
					<ModalAny
						isOpen={!!selectedTransaction}
						onClose={() => setSelectedTransaction(null)}
						title={selectedTransaction.type === "kasbon" ? "Detail Kasbon" : "Detail Pembayaran"}
						description={null}
						size="sm"
					>
						<div className="space-y-4">
							<div>
								<p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Jenis</p>
								<p className="mt-1 text-base font-semibold text-neutral-950 dark:text-white">
									{selectedTransaction.type === "kasbon" ? "Kasbon Baru" : "Pembayaran"}
								</p>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Nominal</p>
									<p className={`mt-1 text-base font-black ${selectedTransaction.type === "kasbon" ? "text-rose-500" : "text-emerald-500"}`}>
										{selectedTransaction.type === "kasbon" ? "+" : "-"} {formatRupiah(selectedTransaction.nominal)}
									</p>
								</div>
								<div>
									<p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Tanggal</p>
									<p className="mt-1 text-base font-semibold text-neutral-950 dark:text-white">{formatShortDate(selectedTransaction.tanggal)}</p>
								</div>
							</div>
							{selectedTransaction.type === "kasbon" && (
								<>
									<div>
										<p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Target Pembayaran</p>
										<p className="mt-1 text-base font-semibold text-neutral-950 dark:text-white capitalize">
											{selectedTransaction.target === "cicil" ? "Cicilan" : "Lunas"}
										</p>
									</div>
									{selectedTransaction.tanggalJanji && (
										<div>
											<p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Janji Bayar</p>
											<p className="mt-1 text-base font-semibold text-neutral-950 dark:text-white">{formatShortDate(selectedTransaction.tanggalJanji)}</p>
										</div>
									)}
								</>
							)}
							{selectedTransaction.type === "bayar" && selectedTransaction.tanggalJanji && (
								<div>
									<p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Janji Bayar Berikutnya</p>
									<p className="mt-1 text-base font-semibold text-neutral-950 dark:text-white">{formatShortDate(selectedTransaction.tanggalJanji)}</p>
								</div>
							)}
							{selectedTransaction.keterangan && (
								<div>
									<p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Keterangan</p>
									<p className="mt-1 text-base text-neutral-700 dark:text-neutral-300">{selectedTransaction.keterangan}</p>
								</div>
							)}
						</div>
						<div className="pt-6">
							<ButtonAny text="Tutup" variant="secondary" size="medium" onClick={() => setSelectedTransaction(null)} className="w-full" />
						</div>
					</ModalAny>
				)}
			</div>
		</section>
	);
}

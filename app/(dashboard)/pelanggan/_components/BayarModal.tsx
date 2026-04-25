"use client";

import { useEffect, useId } from "react";
import type { ComponentType } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { BayarForm } from "@/features/pelanggan/types";
import { bayarSchema } from "@/lib/validation/pelanggan";

import Modal from "@/components/modal/Modal";
import { ButtonAny, InputAny } from "./ui-adapters";
import { formatRupiah } from "@/features/pelanggan/utils";
import { ModalDateField, ModalSelectField } from "./helpers/modal-form-fields";

type BayarModalProps = {
	open: boolean;
	form: BayarForm;
	totalUtang: number;
	onClose: () => void;
	onSubmit: (values: BayarForm) => Promise<void>;
};

export default function BayarModal({
	open,
	form,
	totalUtang,
	onClose,
	onSubmit,
}: BayarModalProps) {
	const ModalAny = Modal as unknown as ComponentType<Record<string, unknown>>;
	const formId = useId();
	const {
		register,
		handleSubmit,
		reset,
		setValue,
		control,
		formState: { errors, isSubmitting },
	} = useForm<BayarForm>({
		resolver: zodResolver(bayarSchema),
		defaultValues: form,
	});
	const jenis = useWatch({ control, name: "jenis" });
	const nominalField = useWatch({ control, name: "nominal" });
	const tanggalBayar = useWatch({ control, name: "tanggalBayar" });
	const tanggalJanji = useWatch({ control, name: "tanggalJanji" });

	useEffect(() => {
		if (open) {
			reset(form);
		}
	}, [form, open, reset]);

	if (!open) return null;

	const nominal = Number(nominalField || 0);
	const sisaUtang = Math.max(totalUtang - nominal, 0);

	return (
		<ModalAny
			isOpen={open}
			onClose={onClose}
			title="Tambah Bayar"
			description="Input pembayaran pelanggan dengan nominal, tanggal bayar, dan catatan bila diperlukan."
			size="2xl"
			footer={
				<div className="flex justify-end gap-2">
					<ButtonAny text="Batal" variant="secondary" onClick={onClose} />
					<ButtonAny text="Simpan" type="submit" form={formId} loading={isSubmitting} />
				</div>
			}
		>
			<form id={formId} className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
				<ModalSelectField
					label="Jenis Pembayaran"
					value={jenis}
					onChange={(value) => {
						setValue("jenis", value as "lunas" | "sebagian", { shouldValidate: true });
						if (value === "lunas") {
							setValue("nominal", String(totalUtang), { shouldValidate: true });
							setValue("tanggalJanji", "", { shouldValidate: false });
						}
					}}
					options={[
						{ label: "Lunas", value: "lunas" },
						{ label: "Sebagian", value: "sebagian" },
					]}
					helperText="Lunas menutup seluruh sisa utang, sedangkan sebagian hanya mengurangi utang."
					required
				/>

				<InputAny
					label="Nominal Bayar"
					type="number"
					placeholder="200000"
					{...register("nominal")}
					state={errors.nominal ? "error" : "default"}
					disabled={jenis === "lunas"}
					helperText={errors.nominal?.message ?? "Isi nominal yang dibayarkan pada transaksi ini."}
				/>

				<ModalDateField
					label="Tanggal Bayar"
					value={tanggalBayar}
					onChange={(value) => setValue("tanggalBayar", value, { shouldValidate: true })}
					helperText={errors.tanggalBayar?.message ?? "Tanggal pembayaran otomatis hari ini, ubah jika transaksi dicatat lebih awal atau lebih lambat."}
					required
				/>

				{jenis === "sebagian" ? (
					<ModalDateField
						label="Tanggal Janji Bayar"
						value={tanggalJanji ?? ""}
						onChange={(value) => setValue("tanggalJanji", value, { shouldValidate: true })}
						helperText={
							errors.tanggalJanji?.message ??
								"Tanggal ini menandakan kapan pelanggan harus menyelesaikan sisa pembayaran."
						}
						required
					/>
				) : null}

				<InputAny
					variant="textarea"
					label="Keterangan (opsional)"
					placeholder="Tambahkan catatan bila perlu"
					rows={3}
					{...register("keterangan")}
					helperText={errors.keterangan?.message ?? "Tambahkan catatan jika ada alasan atau detail pembayaran."}
				/>

				<div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
					<div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
						<span>Total utang</span>
						<span className="font-semibold">{formatRupiah(totalUtang)}</span>
					</div>
					<div className="mt-1 flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
						<span>Bayar sekarang</span>
						<span className="font-semibold text-orange-600">- {formatRupiah(nominal)}</span>
					</div>
					<div className="mt-2 border-t border-neutral-200 pt-2 dark:border-neutral-700">
						<div className="flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-200">
							<span>Sisa utang</span>
							<span className="font-bold">{formatRupiah(sisaUtang)}</span>
						</div>
					</div>
				</div>
			</form>
		</ModalAny>
	);
}

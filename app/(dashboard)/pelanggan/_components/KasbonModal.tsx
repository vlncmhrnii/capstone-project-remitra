"use client";

import { useEffect, useId } from "react";
import type { ComponentType } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { KasbonForm } from "@/features/pelanggan/types";
import { kasbonSchema } from "@/lib/validation/pelanggan";

import Modal from "@/components/modal/Modal";
import { ButtonAny, InputAny } from "./ui-adapters";
import { ModalDateField, ModalSelectField } from "./helpers/modal-form-fields";

type KasbonModalProps = {
	open: boolean;
	form: KasbonForm;
	onClose: () => void;
	onSubmit: (values: KasbonForm) => Promise<void>;
};

export default function KasbonModal({ open, form, onClose, onSubmit }: KasbonModalProps) {
	const ModalAny = Modal as unknown as ComponentType<Record<string, unknown>>;
	const formId = useId();
	const {
		register,
		handleSubmit,
		reset,
		setValue,
		control,
		formState: { errors, isSubmitting },
	} = useForm<KasbonForm>({
		resolver: zodResolver(kasbonSchema),
		defaultValues: form,
	});
	const tanggalKasbon = useWatch({ control, name: "tanggalKasbon" });
	const tanggalJanji = useWatch({ control, name: "tanggalJanji" });
	const target = useWatch({ control, name: "target" });

	useEffect(() => {
		if (open) {
			reset(form);
		}
	}, [form, open, reset]);

	if (!open) return null;

	return (
		<ModalAny
			isOpen={open}
			onClose={onClose}
			title="Tambah Kasbon"
			description="Catat nominal kasbon baru beserta target pembayaran dan tanggal janji bayar."
			size="2xl"
			footer={
				<div className="flex justify-end gap-2">
					<ButtonAny text="Batal" variant="secondary" onClick={onClose} />
					<ButtonAny text="Simpan" type="submit" form={formId} loading={isSubmitting} />
				</div>
			}
		>
			<form id={formId} className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
				<InputAny
					label="Nominal"
					type="number"
					placeholder="200000"
					{...register("nominal")}
					state={errors.nominal ? "error" : "default"}
					helperText={errors.nominal?.message ?? "Masukkan nilai kasbon dalam rupiah tanpa titik atau koma."}
				/>

				<ModalDateField
					label="Tanggal Kasbon"
					value={tanggalKasbon}
					onChange={(value) => setValue("tanggalKasbon", value, { shouldValidate: true })}
					helperText={errors.tanggalKasbon?.message ?? "Tanggal kasbon otomatis hari ini, ubah jika transaksi dicatat mundur."}
					required
				/>

				<ModalDateField
					label="Tanggal Janji Bayar"
					value={tanggalJanji}
					onChange={(value) => setValue("tanggalJanji", value, { shouldValidate: true })}
					helperText={errors.tanggalJanji?.message ?? "Tanggal ini dipakai untuk menentukan kapan pelanggan jatuh tempo."}
					required
				/>

				<ModalSelectField
					label="Target"
					value={target}
					onChange={(value) => setValue("target", value as "lunas" | "cicil", { shouldValidate: true })}
					options={[
						{ label: "Lunas", value: "lunas" },
						{ label: "Cicil", value: "cicil" },
					]}
					helperText="Pilih apakah pembayaran ditargetkan lunas sekaligus atau bisa dicicil."
					required
				/>

				<InputAny
					variant="textarea"
					label="Keterangan (opsional)"
					placeholder="Contoh: Beli sembako"
					rows={3}
					{...register("keterangan")}
					helperText={errors.keterangan?.message ?? "Tambahkan catatan tambahan bila ada detail barang atau konteks transaksi."}
				/>
			</form>
		</ModalAny>
	);
}

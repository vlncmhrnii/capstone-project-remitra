"use client";

import { useEffect, useId } from "react";
import type { ComponentType } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "@/components/modal/Modal";
import { ButtonAny, InputAny } from "./ui-adapters";
import type { CustomerForm } from "@/features/pelanggan/types";
import { customerSchema } from "@/lib/validation/pelanggan";

type CustomerModalProps = {
	open: boolean;
	isEditing: boolean;
	initialValues: CustomerForm;
	onClose: () => void;
	onSubmit: (values: CustomerForm) => Promise<void>;
};

export default function CustomerModal({
	open,
	isEditing,
	initialValues,
	onClose,
	onSubmit,
}: CustomerModalProps) {
	const ModalAny = Modal as unknown as ComponentType<Record<string, unknown>>;
	const formId = useId();
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CustomerForm>({
		resolver: zodResolver(customerSchema),
		defaultValues: initialValues,
	});

	useEffect(() => {
		if (open) {
			reset(initialValues);
		}
	}, [open, initialValues, reset]);

	if (!open) return null;

	return (
		<ModalAny
			isOpen={open}
			onClose={onClose}
			title={isEditing ? "Edit Pelanggan" : "Tambah Pelanggan"}
			description={
				isEditing
					? "Perbarui identitas pelanggan agar data tetap rapi dan mudah dicari."
					: "Isi identitas dasar pelanggan sebelum menambahkan kasbon atau pembayaran."
				}
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
					label="Nama Pelanggan"
					required
					placeholder="Contoh : Siti Aminah"
					{...register("nama")}
					state={errors.nama ? "error" : "default"}
					helperText={errors.nama?.message ?? "Masukkan nama yang akan dipakai untuk kartu dan detail pelanggan."}
				/>
				<InputAny
					label="Nomor HP"
					required
					placeholder="Contoh : 081234567890"
					{...register("no_hp")}
					state={errors.no_hp ? "error" : "default"}
					helperText={errors.no_hp?.message ?? "Nomor ini dipakai untuk komunikasi dan tagihan via WhatsApp."}
				/>
				<InputAny
					variant="textarea"
					label="Alamat"
					placeholder="Contoh : Jl. Merdeka No. 123"
					rows={3}
					{...register("alamat")}
					state={errors.alamat ? "error" : "default"}
					helperText={errors.alamat?.message ?? "Tulis alamat singkat agar pelanggan lebih mudah diidentifikasi."}
				/>
			</form>
		</ModalAny>
	);
}

import type { ComponentType } from "react";
import Modal from "@/components/modal/Modal";
import { ButtonAny } from "./ui-adapters";

type DeleteConfirmModalProps = {
	open: boolean;
	loading?: boolean;
	name?: string;
	onCancel: () => void;
	onConfirm: () => Promise<void>;
};

export default function DeleteConfirmModal({
	open,
	loading = false,
	name,
	onCancel,
	onConfirm,
}: DeleteConfirmModalProps) {
	const ModalAny = Modal as unknown as ComponentType<Record<string, unknown>>;
	if (!open) return null;

	return (
		<ModalAny
			isOpen={open}
			onClose={onCancel}
			title="Hapus Pelanggan"
			description="Tindakan ini akan menghapus data pelanggan beserta semua transaksi yang terhubung."
			size="md"
			footer={
				<div className="flex justify-end gap-2">
					<ButtonAny text="Batal" variant="secondary" onClick={onCancel} />
					<ButtonAny text="Hapus" variant="danger" onClick={() => void onConfirm()} loading={loading} />
				</div>
			}
		>
			<p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Yakin ingin menghapus {name ?? "pelanggan"}?</p>
		</ModalAny>
	);
}

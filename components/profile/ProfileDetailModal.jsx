"use client";

import Avatar from "@/components/avatar/Avatar";
import Modal from "@/components/modal/Modal";

function formatJoinDate(value) {
  if (!value) {
    return "Belum tersedia";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Belum tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function DetailRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/60">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {value || "Belum tersedia"}
      </p>
    </div>
  );
}

export default function ProfileDetailModal({ isOpen, onClose, profile }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Profil"
      description="Informasi detail tentang profil akun Anda."
      size="2xl"
    >
      <div className="space-y-6">
        <div className="rounded-3xl border border-orange-100 bg-linear-to-br from-orange-50 via-white to-amber-50 p-5 dark:border-orange-900/30 dark:from-orange-500/10 dark:via-neutral-900 dark:to-neutral-900">
          <div className="flex items-start gap-4">
            <Avatar name={profile.name} size="h3" className="h-14 w-14" />

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500 dark:text-orange-300">
                Profil Akun
              </p>
              <h4 className="mt-2 truncate text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {profile.name || "Pengguna"}
              </h4>
              <p className="mt-1 truncate text-sm text-neutral-600 dark:text-neutral-400">
                {profile.email || "Email belum tersedia"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DetailRow label="Nama Lengkap" value={profile.name} />
          <DetailRow label="Email" value={profile.email} />
          <DetailRow label="Nama Toko / Usaha" value={profile.storeName} />
          <DetailRow label="Bergabung Sejak" value={formatJoinDate(profile.createdAt)} />
        </div>
      </div>
    </Modal>
  );
}

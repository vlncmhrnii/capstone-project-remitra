"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ArrowsRightLeftIcon,
  BanknotesIcon,
  ChartBarSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";

import Alert from "@/components/alert/Alert";
import { createClient } from "@/lib/supabase.js";
import { fetchDashboardStats, kirimTagihanWA } from "@/lib/services/pelanggan.service";
import DashboardPageSkeleton from "./_components/DashboardPageSkeleton";

function buildNotice(message: string, tone: "success" | "delete") {
  return {
    title: tone === "success" ? "Berhasil" : "Gagal",
    description: message,
    tone,
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [reminderPage, setReminderPage] = useState(0);
  const [notice, setNotice] = useState<{
    title: string;
    description: string;
    tone: "success" | "delete";
  } | null>(null);
  const [namaToko, setNamaToko] = useState("Toko Kami");
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  type BadgeType = "up" | "active" | "urgent" | "done";
  type SummaryIcon = ComponentType<SVGProps<SVGSVGElement>>;
  type SummaryCard = {
    title: string;
    value: string;
    subtitle: string;
    cardSurface: string;
    cardBorder: string;
    valueColor: string;
    subtitleColor: string;
    icon: SummaryIcon;
    iconContainer: string;
    iconColor: string;
    badge: BadgeType;
  };

  type CustomerCategory = {
    label: string;
    count: string;
    note: string;
    chipClass: string;
    cardClass: string;
  };

  type ReminderItem = {
    kasbonId: string;
    name: string;
    noHp: string;
    kategori: "Green" | "Yellow" | "Red" | "Black";
    jumlah: number;
    tanggalJanji: string;
    info: string;
    amount: string;
    stateClass: string;
  };

  const [stats, setStats] = useState<{
    totalKasbon: number;
    totalBayar: number;
    sisaPiutang: number;
    totalPiutang: number;
    transaksiAktif: number;
    jatuhTempoHariIni: number;
    lunasBulanIni: number;
    lunasBulanIniCount: number;
    kategoriCount: Record<string, number>;
    reminders: ReminderItem[];
  } | null>(null);

  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  const summaryCards: SummaryCard[] = [
    {
      title: "Total Kasbon",
      value: stats ? fmt(stats.totalKasbon) : "Rp 0",
      subtitle: "Akumulasi seluruh kasbon",
      cardSurface: "bg-orange-100 dark:bg-orange-950/55",
      cardBorder: "border-orange-300 dark:border-orange-800",
      valueColor: "text-orange-700 dark:text-orange-300",
      subtitleColor: "text-orange-600 dark:text-orange-200",
      icon: BanknotesIcon,
      iconContainer: "bg-orange-600",
      iconColor: "text-white",
      badge: "up",
    },
    {
      title: "Sudah Dibayar",
      value: stats ? fmt(stats.totalBayar) : "Rp 0",
      subtitle: "Pembayaran yang sudah masuk",
      cardSurface: "bg-orange-50 dark:bg-orange-950/45",
      cardBorder: "border-orange-300 dark:border-orange-800",
      valueColor: "text-orange-700 dark:text-orange-300",
      subtitleColor: "text-orange-700/85 dark:text-orange-200",
      icon: CheckCircleIcon,
      iconContainer: "bg-orange-600",
      iconColor: "text-white",
      badge: "done",
    },
    {
      title: "Sisa Piutang",
      value: stats ? fmt(stats.sisaPiutang) : "Rp 0",
      subtitle: "Nominal yang masih ditagih",
      cardSurface: "bg-orange-100 dark:bg-orange-950/55",
      cardBorder: "border-orange-300 dark:border-orange-800",
      valueColor: "text-orange-700 dark:text-orange-300",
      subtitleColor: "text-orange-700/85 dark:text-orange-200",
      icon: ChartBarSquareIcon,
      iconContainer: "bg-orange-600",
      iconColor: "text-white",
      badge: "urgent",
    },
    {
      title: "Transaksi Aktif",
      value: stats ? String(stats.transaksiAktif) : "0",
      subtitle: "Kasbon berjalan",
      cardSurface: "bg-orange-50 dark:bg-orange-950/45",
      cardBorder: "border-orange-300 dark:border-orange-800",
      valueColor: "text-orange-700 dark:text-orange-300",
      subtitleColor: "text-orange-700/85 dark:text-orange-200",
      icon: ArrowsRightLeftIcon,
      iconContainer: "bg-orange-600",
      iconColor: "text-white",
      badge: "active",
    },
  ];

  const badgeClassMap = {
    up: "bg-orange-200 text-orange-800 dark:bg-orange-500/25 dark:text-orange-100",
    active: "bg-amber-200 text-amber-800 dark:bg-amber-500/25 dark:text-amber-100",
    urgent: "bg-orange-300 text-orange-900 dark:bg-orange-400/30 dark:text-orange-100",
    done: "bg-orange-200 text-orange-800 dark:bg-orange-500/25 dark:text-orange-100",
  } as const;

  const badgeLabelMap = {
    up: "KASBON",
    active: "AKTIF",
    urgent: "TAGIH",
    done: "MASUK",
  } as const;

  // Update notes sesuai rules skor gabungan terbaru
  const customerCategories: CustomerCategory[] = [
    {
      label: "Green",
      count: `${stats?.kategoriCount.Green ?? 0} orang`,
      note: "Tidak ada utang yang telat (0 hari).",
      chipClass: "bg-emerald-500 text-white",
      cardClass: "border-orange-200 bg-white/90 dark:border-orange-900/60 dark:bg-neutral-900/70",
    },
    {
      label: "Yellow",
      count: `${stats?.kategoriCount.Yellow ?? 0} orang`,
      note: "Ada utang telat 1–7 hari, mohon dipantau.",
      chipClass: "bg-amber-400 text-amber-950",
      cardClass: "border-orange-200 bg-white/90 dark:border-orange-900/60 dark:bg-neutral-900/70",
    },
    {
      label: "Red",
      count: `${stats?.kategoriCount.Red ?? 0} orang`,
      note: "Ada utang telat 8–30 hari, segera ditagih.",
      chipClass: "bg-rose-500 text-white",
      cardClass: "border-orange-200 bg-white/90 dark:border-orange-900/60 dark:bg-neutral-900/70",
    },
    {
      label: "Black",
      count: `${stats?.kategoriCount.Black ?? 0} orang`,
      note: "Ada lebih dari satu utang telat lebih dari 30 hari (macet).",
      chipClass: "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900",
      cardClass: "border-orange-200 bg-white/90 dark:border-orange-900/60 dark:bg-neutral-900/70",
    },
  ];

  const reminders: ReminderItem[] = stats?.reminders ?? [];

  const remindersPerPage = 3;
  const reminderTotalPages = Math.ceil(reminders.length / remindersPerPage);
  const safeReminderPage =
    reminderTotalPages === 0 ? 0 : Math.min(reminderPage, reminderTotalPages - 1);
  const pagedReminders = reminders.slice(
    safeReminderPage * remindersPerPage,
    safeReminderPage * remindersPerPage + remindersPerPage,
  );
  const totalSegmentedCustomers = stats
    ? Object.values(stats.kategoriCount).reduce((total, count) => total + count, 0)
    : 0;

  useEffect(() => {
    const supabase = createClient();

    async function verifySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setNamaToko(session.user.user_metadata?.nama_toko ?? "Toko Kami");
      setReady(true);
    }

    void verifySession();
  }, [router]);

  useEffect(() => {
    if (!ready) return;

    let isActive = true;
    let isRefreshing = false;

    const refreshStats = async () => {
      if (isRefreshing) return;

      isRefreshing = true;

      try {
        const nextStats = await fetchDashboardStats();
        if (!isActive || !nextStats) return;
        setStats(nextStats);
      } finally {
        isRefreshing = false;
      }
    };

    void refreshStats();

    const refreshInterval = window.setInterval(() => {
      void refreshStats();
    }, 30000);

    const handleFocus = () => {
      void refreshStats();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshStats();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isActive = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [ready]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <p className="text-neutral-600 dark:text-neutral-300">Memuat dashboard...</p>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="min-h-screen -mx-3 -mt-3 px-3 pt-3 pb-4 lg:-mx-5 lg:-mt-4 lg:px-4 lg:pt-4 lg:pb-6">
        <DashboardPageSkeleton />
      </main>
    );
  }

  return (
    <main className="min-h-screen -mx-3 -mt-3 px-3 pt-3 pb-4 lg:-mx-5 lg:-mt-4 lg:px-4 lg:pt-4 lg:pb-6">
      <AnimatePresence>
        {notice ? (
          <Alert
            title={notice.title}
            description={notice.description}
            type={notice.tone}
            mode="absolute"
            duration={3000}
            showCloseButton={false}
            onClose={() => setNotice(null)}
          />
        ) : null}
      </AnimatePresence>

      <section className="relative w-full overflow-hidden rounded-3xl border border-orange-200 bg-white/95 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90">
        <div className="relative overflow-hidden border-b border-orange-300/70 bg-linear-to-r from-orange-600 via-orange-500 to-orange-400 px-4 py-4 dark:border-orange-800 dark:from-orange-700 dark:via-orange-600 dark:to-orange-500 md:px-5 md:py-5">
          <div
            className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full border border-white/20 bg-white/15"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-28 top-8 h-16 w-16 rounded-full border border-white/20 bg-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-12 -bottom-14 h-32 w-32 rounded-full border border-orange-200/30 bg-orange-300/20"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-1/3 top-1/2 h-12 w-12 rounded-full border border-white/20 bg-white/10"
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-3 md:gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/85 dark:text-white/80">
                Dashboard Overview
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                Ringkasan
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-white/85 md:text-base">
                Snapshot performa kasbon hari ini
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm md:py-1.5 md:text-sm">
              <ClockIcon className="h-4 w-4" aria-hidden="true" />
              {formattedDateTime}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-4 md:p-5">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className={`group relative flex min-h-48 flex-col rounded-3xl border p-4 pr-8 pb-8 md:min-h-52 md:p-5 md:pr-12 md:pb-12 ${card.cardSurface} ${card.cardBorder}`}
              >
                <Icon
                  className="pointer-events-none absolute bottom-3 right-3 h-20 w-20 text-orange-300/45 dark:text-orange-200/15"
                  aria-hidden="true"
                />

                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${card.iconContainer}`}
                  >
                    <Icon className={`h-5 w-5 ${card.iconColor}`} aria-hidden="true" />
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeClassMap[card.badge]}`}
                  >
                    {badgeLabelMap[card.badge]}
                  </span>
                </div>

                <h2 className="mt-4 min-h-2 font-bold leading-tight text-neutral-800 dark:text-neutral-100">
                  {card.title}
                </h2>

                <div className="mt-2 space-y-1.5">
                  <p className={`text-4xl font-black tracking-tight md:text-[2.5rem] ${card.valueColor}`}>
                    {card.value}
                  </p>
                  <p className={`text-sm font-medium ${card.subtitleColor}`}>
                    {card.subtitle}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_1fr]">
        <article className="flex h-full flex-col rounded-3xl border border-orange-200 bg-linear-to-br from-orange-50 via-white to-orange-50/70 p-4 dark:border-orange-800 dark:from-orange-950/30 dark:via-neutral-900 dark:to-orange-950/20 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-orange-600 dark:text-orange-300">
                Risk Segmentation
              </p>
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
                Kategori Pelanggan
              </h2>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300">
              <UserGroupIcon className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {customerCategories.map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border p-4 ${item.cardClass}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.chipClass}`}>
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200">
                    {item.count}
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium leading-relaxed text-neutral-700 dark:text-neutral-200">
                  {item.note}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-orange-200/80 bg-white/75 p-2 dark:border-orange-900/50 dark:bg-neutral-900/60">
            <p className="px-2 text-xs font-semibold text-orange-700 dark:text-orange-300">
              Total tersegmentasi: {totalSegmentedCustomers} orang
            </p>
            <span className="rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
              Aktif
            </span>
          </div>
        </article>

        <article className="flex h-full flex-col rounded-3xl border border-orange-200 bg-linear-to-br from-orange-50 via-white to-orange-50/70 p-4 dark:border-orange-800 dark:from-orange-950/30 dark:via-neutral-900 dark:to-orange-950/20 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-orange-600 dark:text-orange-300">
                Action Queue
              </p>
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
                Reminder WA Hari Ini
              </h2>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-500 text-white">
              <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>


          <div className="space-y-3">
            {pagedReminders.map((item) => {
              return (
                <div
                  key={item.kasbonId}
                  className="rounded-2xl border border-orange-200 bg-white/90 p-3 dark:border-orange-900/60 dark:bg-neutral-900/70 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">{item.name}</span>
                    </div>
                    <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                      {item.info} - {item.amount}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!item.noHp) {
                        setNotice(
                          buildNotice(
                            `Nomor WhatsApp untuk ${item.name} belum tersedia.`,
                            "delete",
                          ),
                        );
                        return;
                      }

                      setSendingReminderId(item.kasbonId);

                      try {
                        await kirimTagihanWA(
                          item.kasbonId,
                          item.noHp,
                          item.name,
                          item.jumlah,
                          item.tanggalJanji,
                          item.kategori.toLowerCase(),
                          namaToko,
                        );
                        setNotice(
                          buildNotice(
                            `Template WhatsApp untuk ${item.name} siap dikirim.`,
                            "success",
                          ),
                        );
                      } catch (error) {
                        console.error(error);
                        setNotice(
                          buildNotice(
                            `Gagal menyiapkan reminder WhatsApp untuk ${item.name}.`,
                            "delete",
                          ),
                        );
                      } finally {
                        setSendingReminderId(null);
                      }
                    }}
                    disabled={sendingReminderId === item.kasbonId}
                    className="ml-auto rounded-full bg-orange-500 px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sendingReminderId === item.kasbonId ? "Memproses..." : "Tagih via WA"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-orange-200/80 bg-white/75 p-2 dark:border-orange-900/50 dark:bg-neutral-900/60">
            <button
              type="button"
              onClick={() => setReminderPage((current) => Math.max(current - 1, 0))}
              disabled={reminderTotalPages === 0 || safeReminderPage === 0}
              className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-orange-700 transition enabled:hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-orange-200 dark:enabled:hover:bg-orange-500/20"
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
              Prev
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: reminderTotalPages }).map((_, index) => (
                <button
                  key={`dot-${index}`}
                  type="button"
                  onClick={() => setReminderPage(index)}
                  aria-label={`Halaman reminder ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all ${
                    safeReminderPage === index
                      ? "w-6 bg-orange-500"
                      : "w-2.5 bg-orange-200 dark:bg-orange-700"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setReminderPage((current) =>
                  reminderTotalPages === 0
                    ? 0
                    : Math.min(current + 1, reminderTotalPages - 1),
                )
              }
              disabled={
                reminderTotalPages === 0 ||
                safeReminderPage >= reminderTotalPages - 1
              }
              className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-orange-700 transition enabled:hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-orange-200 dark:enabled:hover:bg-orange-500/20"
            >
              Next
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}

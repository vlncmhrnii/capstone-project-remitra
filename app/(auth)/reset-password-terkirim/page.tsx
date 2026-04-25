"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import emailAnimation from "@/public/lottie/Login.json";

const revealTransition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function ResetPasswordTerkirimPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-br from-orange-50 via-white to-amber-50 text-neutral-900 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900 dark:text-zinc-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-orange-300/35 blur-3xl dark:bg-orange-600/20" />
        <div className="absolute right-0 top-14 h-72 w-72 rounded-full bg-amber-200/35 blur-3xl dark:bg-amber-500/10" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-[30%] bg-orange-200/30 blur-3xl dark:bg-orange-700/15" />
      </div>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl items-stretch gap-0 px-5 py-8 lg:grid-cols-2 lg:px-8 lg:py-10">
        <motion.article
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={revealTransition}
          className="relative flex h-full w-full overflow-hidden rounded-t-4xl border border-b-0 border-orange-200/60 bg-linear-to-br from-orange-500 via-orange-500 to-amber-500 px-6 py-8 text-white shadow-[0_35px_80px_-42px_rgba(249,115,22,0.7)] dark:border-orange-400/20 lg:rounded-tl-4xl lg:rounded-bl-4xl lg:rounded-tr-none lg:rounded-br-none lg:border-r-0 lg:border-b lg:px-8 lg:py-10"
        >
          <div className="pointer-events-none absolute -top-12 -right-8 h-48 w-48 rounded-full border border-white/20" />
          <div className="pointer-events-none absolute -left-10 top-32 h-20 w-20 rounded-2xl border border-white/25 bg-white/10" />
          <div className="pointer-events-none absolute right-8 bottom-12 h-32 w-32 rotate-45 rounded-3xl bg-white/15" />

          <div className="relative flex h-full w-full max-w-xl flex-col items-center justify-center gap-5 text-center lg:gap-6">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
                Remitra
              </p>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
                Link reset sedang dalam perjalanan
              </h1>
              <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base">
                Kami sudah memproses permintaan reset password. Buka email kamu
                lalu lanjutkan pengaturan kata sandi baru dari tautan yang
                dikirim.
              </p>
            </div>

            <div className="pt-3 lg:pt-4">
              <Lottie
                animationData={emailAnimation}
                loop
                autoplay
                className="h-64 w-full sm:h-80 lg:h-90"
              />
            </div>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={revealTransition}
          className="relative flex h-full w-full overflow-hidden rounded-b-4xl border border-t-0 border-orange-200/60 bg-white/90 shadow-[0_35px_75px_-42px_rgba(249,115,22,0.65)] backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/80 dark:shadow-[0_35px_75px_-42px_rgba(0,0,0,0.8)] lg:rounded-tr-4xl lg:rounded-br-4xl lg:rounded-tl-none lg:rounded-bl-none lg:border-l lg:border-t-0"
        >
          <div className="pointer-events-none absolute -right-8 top-8 h-12 w-12 rotate-12 rounded-xl bg-orange-100/80 dark:bg-zinc-800" />
          <div className="pointer-events-none absolute -left-4 bottom-12 h-8 w-8 rounded-full bg-amber-200/70 dark:bg-zinc-700" />

          <div className="flex h-full w-full flex-col justify-center p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 dark:text-orange-400">
              Reset Password
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Cek email kamu
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-zinc-300">
              Jika email terdaftar, kami telah mengirim link reset password ke
              inbox kamu. Klik tautan itu untuk membuat kata sandi baru.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  step: "1",
                  title: "Buka inbox email",
                  desc: "Cari email dari Remitra di inbox utama, promotion, atau spam.",
                },
                {
                  step: "2",
                  title: "Klik link reset password",
                  desc: "Tautan akan membuka halaman aman untuk membuat kata sandi baru.",
                },
                {
                  step: "3",
                  title: "Login kembali",
                  desc: "Setelah password diperbarui, masuk lagi ke Remitra dengan password baru.",
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-sm text-neutral-500 dark:text-zinc-400">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-orange-100 bg-orange-50 p-4 dark:border-orange-900/30 dark:bg-orange-950/20">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Tidak melihat emailnya? Cek folder spam atau tunggu beberapa
                menit sebelum meminta tautan reset yang baru.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Kembali ke login
              </Link>
              <Link
                href="/forgot-password"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-orange-200 bg-white px-6 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 dark:border-orange-900/40 dark:bg-zinc-900 dark:text-orange-400 dark:hover:bg-orange-950/20"
              >
                Kirim ulang link
              </Link>
            </div>
          </div>
        </motion.article>
      </section>
    </main>
  );
}

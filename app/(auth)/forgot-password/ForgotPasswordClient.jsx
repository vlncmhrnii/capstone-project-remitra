"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Alert from "@/components/alert/Alert";
import Button from "@/components/button/Button";
import Input from "@/components/input/Input";
import {
  formatCooldownSeconds,
  getEmailActionCooldownMs,
  getRemainingEmailCooldown,
  startEmailCooldown,
} from "@/lib/auth/email-rate-limit";
import { createClient } from "@/lib/supabase";
import loginAnimation from "@/public/lottie/Login.json";

function buildNotice(message, tone) {
  return {
    title: tone === "success" ? "Berhasil" : "Gagal",
    description: message,
    tone,
  };
}

function getResetPasswordRedirectUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/reset-password`;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  return appUrl ? `${appUrl}/reset-password` : undefined;
}

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid."),
});

const revealTransition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };

export default function ForgotPasswordClient() {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [cooldownTick, setCooldownTick] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const emailValue = useWatch({
    control,
    name: "email",
  });

  const activeCooldownEmail = emailValue || submittedEmail;
  const cooldownMs = getRemainingEmailCooldown("forgot-password", activeCooldownEmail);

  useEffect(() => {
    if (!cooldownMs || !activeCooldownEmail) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const nextRemaining = getRemainingEmailCooldown(
        "forgot-password",
        activeCooldownEmail,
      );

      setCooldownTick((current) => current + 1);

      if (!nextRemaining) {
        window.clearInterval(intervalId);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeCooldownEmail, cooldownMs]);

  async function onSubmit(values) {
    setNotice(null);
    const remainingCooldown = getRemainingEmailCooldown("forgot-password", values.email);

    if (remainingCooldown > 0) {
      setSubmittedEmail(values.email);
      setCooldownTick((current) => current + 1);
      setNotice(
        buildNotice(
          `Tunggu ${formatCooldownSeconds(remainingCooldown)} detik sebelum meminta tautan reset lagi.`,
          "delete",
        ),
      );
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const redirectTo = getResetPasswordRedirectUrl();
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo,
      });

      if (error) {
        if (error.code === "over_email_send_rate_limit") {
          const nextCooldownMs = getEmailActionCooldownMs();
          startEmailCooldown("forgot-password", values.email, nextCooldownMs);
          setSubmittedEmail(values.email);
          setCooldownTick((current) => current + 1);
          setNotice(
            buildNotice(
              `Terlalu banyak permintaan. Coba lagi dalam ${formatCooldownSeconds(nextCooldownMs)} detik.`,
              "delete",
            ),
          );
          return;
        }

        setNotice(buildNotice(error.message, "delete"));
        return;
      }

      const nextCooldownMs = getEmailActionCooldownMs();
      startEmailCooldown("forgot-password", values.email, nextCooldownMs);
      setSubmittedEmail(values.email);
      setCooldownTick((current) => current + 1);
      setNotice(
        buildNotice(
          "Jika email terdaftar, kami telah mengirim tautan untuk mengatur ulang kata sandi.",
          "success",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  const isCooldownActive = cooldownMs > 0;
  void cooldownTick;
  const buttonLabel = isCooldownActive
    ? `Tunggu ${formatCooldownSeconds(cooldownMs)} detik`
    : "Kirim Tautan Reset";

  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-br from-orange-50 via-white to-amber-50 text-neutral-900 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900 dark:text-zinc-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-orange-300/35 blur-3xl dark:bg-orange-600/20" />
        <div className="absolute right-0 top-14 h-72 w-72 rounded-full bg-amber-200/35 blur-3xl dark:bg-amber-500/10" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-[30%] bg-orange-200/30 blur-3xl dark:bg-orange-700/15" />
      </div>

      <AnimatePresence>
        {notice ? (
          <Alert
            title={notice.title}
            description={notice.description}
            type={notice.tone}
            mode="absolute"
            duration={3500}
            showCloseButton={false}
            onClose={() => setNotice(null)}
          />
        ) : null}
      </AnimatePresence>

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
                Pulihkan akses akunmu
              </h1>
              <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base">
                Masukkan email yang terdaftar. Kami akan kirim tautan aman untuk
                membuat kata sandi baru.
              </p>
            </div>

            <div className="pt-3 lg:pt-4">
              <Lottie
                animationData={loginAnimation}
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
              Lupa Kata Sandi
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Minta tautan reset password
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-zinc-300">
              Demi keamanan, kami selalu menampilkan pesan yang sama meskipun
              email belum terdaftar.
            </p>

            <form
              className="mt-8 space-y-4"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <Input
                label="Email"
                type="email"
                placeholder="Contoh : nama@mail.com"
                state={errors.email ? "error" : "default"}
                helperText={errors.email?.message ?? ""}
                {...register("email")}
                required
              />

              <Button
                type="submit"
                size="large"
                variant="primary"
                loading={loading}
                disabled={isCooldownActive}
                className="mt-3 w-full"
              >
                {buttonLabel}
              </Button>
            </form>

            <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-4 dark:border-orange-900/30 dark:bg-orange-950/20">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {submittedEmail
                  ? isCooldownActive
                    ? `Email ke ${submittedEmail} baru saja diproses. Tunggu ${formatCooldownSeconds(cooldownMs)} detik sebelum mencoba lagi.`
                    : `Jika email ${submittedEmail} terdaftar, cek inbox dan folder spam untuk menemukan tautan reset.`
                  : "Gunakan email yang sama dengan akun Remitra kamu agar tautan reset bisa dikirim."}
              </p>
            </div>

            <p className="mt-4 text-center text-sm text-neutral-600 dark:text-zinc-400">
              Ingat kata sandi?{" "}
              <Link
                href="/login"
                className="font-semibold text-orange-600 transition hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
              >
                Kembali ke login
              </Link>
            </p>
          </div>
        </motion.article>
      </section>
    </main>
  );
}

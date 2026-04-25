"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Alert from "@/components/alert/Alert";
import Button from "@/components/button/Button";
import Input from "@/components/input/Input";
import { createClient } from "@/lib/supabase";
import loginAnimation from "@/public/lottie/Login.json";

function buildNotice(message, tone) {
  return {
    title: tone === "success" ? "Berhasil" : "Gagal",
    description: message,
    tone,
  };
}

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password baru wajib diisi.")
      .min(6, "Password minimal 6 karakter."),
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password harus sama.",
  });

const revealTransition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };

export default function ResetPasswordClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function prepareRecoverySession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setNotice(buildNotice(error.message, "delete"));
        setIsCheckingSession(false);
        return;
      }

      if (session) {
        setIsReady(true);
        setIsCheckingSession(false);
        return;
      }

      setIsCheckingSession(false);
    }

    void prepareRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) {
        return;
      }

      if (event === "PASSWORD_RECOVERY" || Boolean(session)) {
        setIsReady(true);
        setIsCheckingSession(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(values) {
    setNotice(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        setNotice(buildNotice(error.message, "delete"));
        return;
      }

      setNotice(
        buildNotice(
          "Kata sandi berhasil diperbarui. Mengarahkan ke halaman login...",
          "success",
        ),
      );

      setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 1500);
    } finally {
      setLoading(false);
    }
  }

  const helperMessage = isCheckingSession
    ? "Sedang memverifikasi tautan reset dari email..."
    : isReady
      ? "Tautan valid. Silakan buat kata sandi baru untuk akunmu."
      : "Tautan reset tidak valid atau sudah kedaluwarsa. Minta email reset baru untuk melanjutkan.";

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
                Buat kata sandi baru
              </h1>
              <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base">
                Setelah password diperbarui, kamu bisa login kembali dan
                melanjutkan pekerjaan tanpa kehilangan akses.
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
              Reset Password
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Atur ulang kata sandi
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-zinc-300">
              {helperMessage}
            </p>

            <form
              className="mt-8 space-y-4"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <Input
                label="Password Baru"
                type="password"
                placeholder="Minimal 6 karakter"
                state={errors.password ? "error" : "default"}
                helperText={errors.password?.message ?? ""}
                {...register("password")}
                required
                disabled={!isReady || isCheckingSession}
              />

              <Input
                label="Konfirmasi Password Baru"
                type="password"
                placeholder="Ulangi password baru"
                state={errors.confirmPassword ? "error" : "default"}
                helperText={errors.confirmPassword?.message ?? ""}
                {...register("confirmPassword")}
                required
                disabled={!isReady || isCheckingSession}
              />

              <Button
                type="submit"
                size="large"
                variant="primary"
                loading={loading}
                disabled={!isReady || isCheckingSession}
                className="mt-3 w-full"
              >
                Simpan Password Baru
              </Button>
            </form>

            <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-4 dark:border-orange-900/30 dark:bg-orange-950/20">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Bila tautan sudah tidak berlaku, kembali ke halaman lupa kata
                sandi dan minta email reset yang baru.
              </p>
            </div>

            <p className="mt-4 text-center text-sm text-neutral-600 dark:text-zinc-400">
              Butuh tautan baru?{" "}
              <Link
                href="/forgot-password"
                className="font-semibold text-orange-600 transition hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
              >
                Minta reset lagi
              </Link>
            </p>
          </div>
        </motion.article>
      </section>
    </main>
  );
}

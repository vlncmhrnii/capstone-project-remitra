"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { setProfile } from "@/lib/stores/auth-profile.store";
import loginAnimation from "@/public/lottie/Login.json";

function buildNotice(message, tone) {
  return {
    title: tone === "success" ? "Berhasil" : "Gagal",
    description: message,
    tone,
  };
}

const registerSchema = z
  .object({
    namaToko: z
      .string()
      .min(1, "Nama toko wajib diisi.")
      .min(2, "Nama toko minimal 2 karakter."),
    fullName: z
      .string()
      .min(1, "Nama lengkap wajib diisi.")
      .min(2, "Nama lengkap minimal 2 karakter."),
    email: z
      .string()
      .min(1, "Email wajib diisi.")
      .email("Format email tidak valid."),
    password: z
      .string()
      .min(1, "Password wajib diisi.")
      .min(6, "Password minimal 6 karakter."),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password harus sama.",
  });

export default function RegisterClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [registerCooldownTick, setRegisterCooldownTick] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      namaToko: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const emailValue = useWatch({
    control,
    name: "email",
  });

  const registerCooldownMs = getRemainingEmailCooldown("register", emailValue);

  useEffect(() => {
    if (!registerCooldownMs || !emailValue) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const nextRemaining = getRemainingEmailCooldown("register", emailValue);

      setRegisterCooldownTick((current) => current + 1);

      if (!nextRemaining) {
        window.clearInterval(intervalId);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [registerCooldownMs, emailValue]);

  async function onSubmit(values) {
    setNotice(null);
    const remainingCooldown = getRemainingEmailCooldown("register", values.email);

    if (remainingCooldown > 0) {
      setRegisterCooldownTick((current) => current + 1);
      setNotice(
        buildNotice(
          `Tunggu ${formatCooldownSeconds(remainingCooldown)} detik sebelum mendaftar lagi dengan email ini.`,
          "delete",
        ),
      );
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName.trim(),
            nama_toko: values.namaToko.trim(),
          },
        },
      });

      if (error) {
        if (error.code === "over_email_send_rate_limit") {
          const nextCooldownMs = getEmailActionCooldownMs();
          startEmailCooldown("register", values.email, nextCooldownMs);
          setRegisterCooldownTick((current) => current + 1);
          setNotice(
            buildNotice(
              `Terlalu banyak permintaan email. Coba lagi dalam ${formatCooldownSeconds(nextCooldownMs)} detik.`,
              "delete",
            ),
          );
          return;
        }

        setNotice(buildNotice(error.message, "delete"));
        return;
      }

      if (!data.session) {
        const nextCooldownMs = getEmailActionCooldownMs();
        startEmailCooldown("register", values.email, nextCooldownMs);
        setRegisterCooldownTick((current) => current + 1);
      }

      // Ada session = konfirmasi email dimatikan, langsung masuk dashboard
      if (data.session) {
        if (data.user) {
          setProfile(data.user);
        }
        setNotice(
          buildNotice(
            "Akun berhasil dibuat. Mengarahkan ke dashboard...",
            "success",
          ),
        );
        setTimeout(() => {
          router.replace("/dashboard");
          router.refresh();
        }, 1500);
        return;
      }

      // Tidak ada session = perlu verifikasi email dulu
      setNotice(
        buildNotice(
          "Akun berhasil dibuat. Mengarahkan ke halaman verifikasi...",
          "success",
        ),
      );
      setTimeout(() => {
        router.replace("/verifikasi-email");
      }, 1500);

    } finally {
      setLoading(false);
    }
  }

  const isRegisterCooldownActive = registerCooldownMs > 0;
  void registerCooldownTick;
  const registerButtonLabel = isRegisterCooldownActive
    ? `Tunggu ${formatCooldownSeconds(registerCooldownMs)} detik`
    : "Buat Akun";

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
            duration={3000}
            showCloseButton={false}
            onClose={() => setNotice(null)}
          />
        ) : null}
      </AnimatePresence>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl items-stretch gap-0 px-5 py-8 lg:grid-cols-2 lg:px-8 lg:py-10">
        <motion.article
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
                Buat akun baru di Remitra
              </h1>
              <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base">
                Pendaftaran akun tetap konsisten dengan halaman login, supaya
                alur antar halaman terasa satu sistem.
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
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex h-full w-full overflow-hidden rounded-b-4xl border border-t-0 border-orange-200/60 bg-white/90 shadow-[0_35px_75px_-42px_rgba(249,115,22,0.65)] backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/80 dark:shadow-[0_35px_75px_-42px_rgba(0,0,0,0.8)] lg:rounded-tr-4xl lg:rounded-br-4xl lg:rounded-tl-none lg:rounded-bl-none lg:border-l lg:border-t-0"
        >
          <div className="pointer-events-none absolute -right-8 top-8 h-12 w-12 rotate-12 rounded-xl bg-orange-100/80 dark:bg-zinc-800" />
          <div className="pointer-events-none absolute -left-4 bottom-12 h-8 w-8 rounded-full bg-amber-200/70 dark:bg-zinc-700" />

          <div className="flex h-full w-full flex-col justify-center p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 dark:text-orange-400">
              Daftar
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Lengkapi data pendaftaran
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-zinc-300">
              Gunakan email aktif untuk menerima tautan verifikasi akun.
            </p>

            <form
              className="mt-8 space-y-4"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <Input
                label="Nama Toko / Usaha"
                placeholder="Contoh : Warung Maju Jaya"
                state={errors.namaToko ? "error" : "default"}
                helperText={errors.namaToko?.message ?? ""}
                {...register("namaToko")}
                required
              />

              <Input
                label="Nama Lengkap"
                placeholder="Contoh : UMKM Sejahtera"
                state={errors.fullName ? "error" : "default"}
                helperText={errors.fullName?.message ?? ""}
                {...register("fullName")}
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="Contoh : nama@mail.com"
                state={errors.email ? "error" : "default"}
                helperText={errors.email?.message ?? ""}
                {...register("email")}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Minimal 6 karakter"
                state={errors.password ? "error" : "default"}
                helperText={errors.password?.message ?? ""}
                {...register("password")}
                required
              />

              <Input
                label="Konfirmasi Password"
                type="password"
                placeholder="Ulangi password"
                state={errors.confirmPassword ? "error" : "default"}
                helperText={errors.confirmPassword?.message ?? ""}
                {...register("confirmPassword")}
                required
              />

              <Button
                type="submit"
                size="large"
                variant="primary"
                loading={loading}
                disabled={isRegisterCooldownActive}
                className="w-full mt-3"
              >
                {registerButtonLabel}
              </Button>
            </form>

            <p className="mt-3 text-center text-sm text-neutral-600 dark:text-zinc-400">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-orange-600 transition hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
              >
                Login
              </Link>
            </p>
          </div>
        </motion.article>
      </section>
    </main>
  );
}

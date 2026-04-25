import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata = {
  title: "Lupa Kata Sandi Remitra",
  description: "Minta tautan reset kata sandi untuk memulihkan akses akun Remitra.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { ComponentType } from "react";
import {
  HomeModernIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";
import Logo from "@/components/logo/Logo";
import AuthProfileSync from "@/components/auth/AuthProfileSync";
import ProfileDetailModal from "@/components/profile/ProfileDetailModal";
import { createClient } from "@/lib/supabase";
import { useAuthProfileStore } from "@/lib/stores/auth-profile.store";

type SidebarItem = {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  path: string;
};

type SidebarComponentProps = {
  items: SidebarItem[];
  activeKey: string;
  onActiveChange: (key: string, item: { path?: string }) => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  isCollapsed: boolean;
  width: string;
  collapsedWidth: string;
  className: string;
  logo?: React.ReactNode;
  collapsedLogo?: React.ReactNode;
};

type HeaderComponentProps = {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (
    value: boolean | ((current: boolean) => boolean),
  ) => void;
  menuItems: SidebarItem[];
  onProfileClick?: () => void;
  onLogout?: () => void;
  isLoggingOut?: boolean;
};

const SidebarComponent =
  Sidebar as unknown as ComponentType<SidebarComponentProps>;
const HeaderComponent =
  Header as unknown as ComponentType<HeaderComponentProps>;

const entranceTransition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1] as const,
};

const headerTransition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1] as const,
};

const sidebarItems: SidebarItem[] = [
  { key: "dashboard", label: "Dashboard", icon: HomeModernIcon, path: "/" },
  {
    key: "pelanggan",
    label: "Pelanggan",
    icon: UserGroupIcon,
    path: "/pelanggan",
  },
  { key: "laporan", label: "Laporan", icon: DocumentTextIcon, path: "/laporan" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<
    "checking" | "authenticated" | "unauthenticated"
  >("checking");
  const [shouldPlayEntrance] = useState(() => {
    if (typeof window === "undefined") return false;
    const entranceKey = "dashboard-entrance-played";
    const hasPlayed = sessionStorage.getItem(entranceKey) === "true";
    if (!hasPlayed) {
      sessionStorage.setItem(entranceKey, "true");
      return true;
    }
    return false;
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profile = useAuthProfileStore((state) => state.profile);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function verifyAuth() {
      const { data, error } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (error || !data.user) {
        setAuthStatus("unauthenticated");
        router.replace("/login");
        return;
      }

      setAuthStatus("authenticated");
    }

    void verifyAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === "SIGNED_OUT" || !session?.user) {
        setAuthStatus("unauthenticated");
        router.replace("/login");
        return;
      }

      setAuthStatus("authenticated");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const activeSidebarKey = (() => {
    if (pathname?.startsWith("/pelanggan")) return "pelanggan";
    if (pathname?.startsWith("/kasbon")) return "kasbon";
    if (pathname?.startsWith("/laporan")) return "laporan";
    return "dashboard";
  })();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (authStatus === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 dark:bg-neutral-900">
        <div className="w-full max-w-md rounded-3xl border border-orange-200 bg-white p-6 text-center shadow-[0_24px_80px_-48px_rgba(0,0,0,0.35)] dark:border-neutral-800 dark:bg-neutral-950">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Memeriksa sesi...
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Tunggu sebentar, kami sedang memastikan akses dashboard kamu masih aktif.
          </p>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 dark:bg-neutral-900">
        <div className="w-full max-w-md rounded-3xl border border-orange-200 bg-white p-6 text-center shadow-[0_24px_80px_-48px_rgba(0,0,0,0.35)] dark:border-neutral-800 dark:bg-neutral-950">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Sesi login sudah berakhir
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Demi keamanan, kamu perlu login lagi untuk melanjutkan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-neutral-900 lg:flex-row">
      <motion.div
        initial={shouldPlayEntrance ? { opacity: 0, x: -20 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={
          shouldPlayEntrance
            ? entranceTransition
            : { duration: 0 }
        }
        className="relative z-40 shrink-0"
      >
        <SidebarComponent
          items={sidebarItems}
          activeKey={activeSidebarKey}
          onActiveChange={(_, item) => {
            if (item?.path && item.path !== pathname) router.push(item.path);
          }}
          onProfileClick={() => setIsProfileModalOpen(true)}
          onLogout={handleLogout}
          isCollapsed={isCollapsed}
          width="260px"
          collapsedWidth="90px"
          logo={<Logo collapsed={isCollapsed} />}
          collapsedLogo={<Logo collapsed={true} />}
          className="border-none"
        />
      </motion.div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AuthProfileSync />
        <motion.div
          initial={shouldPlayEntrance ? { opacity: 0, y: -10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={
            shouldPlayEntrance
              ? headerTransition
              : { duration: 0 }
          }
          className="relative z-30"
        >
          <HeaderComponent
            isSidebarCollapsed={isCollapsed}
            setIsSidebarCollapsed={setIsCollapsed}
            menuItems={sidebarItems}
            onProfileClick={() => setIsProfileModalOpen(true)}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        </motion.div>
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>

      <ProfileDetailModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
      />
    </div>
  );
}

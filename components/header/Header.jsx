"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bars3Icon,
  ChevronDownIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  UserIcon,
  XMarkIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Breadcrumbs from "../breadcrumbs/Breadcrumbs";
import Avatar from "../avatar/Avatar";
import { useAuthProfileStore } from "@/lib/stores/auth-profile.store";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function flattenMenuItems(items) {
  const result = [];

  items.forEach((menu) => {
    if (!menu?.key || !menu?.label) return;

    const menuPath =
      menu.path || (menu.key === "dashboard" ? "/" : `/${menu.key}`);

    result.push({
      id: menu.key,
      label: menu.label,
      type: "menu",
      path: menuPath,
    });

    if (Array.isArray(menu.children)) {
      menu.children.forEach((child) => {
        if (!child?.key || !child?.label) return;

        const childPath = child.path || `${menuPath}/${child.key}`;

        result.push({
          id: child.key,
          label: child.label,
          parent: menu.label,
          type: "submenu",
          path: childPath,
        });
      });
    }
  });

  return result;
}

function toTitleCase(value) {
  return String(value)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Header({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  onProfileClick,
  onLogout,
  isLoggingOut = false,
  menuItems = [],
}) {
  const pathname = usePathname();
  const router = useRouter();
  const profileMenuRef = useRef(null);
  const searchRef = useRef(null);
  const profile = useAuthProfileStore((state) => state.profile);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchableItems = useMemo(
    () => flattenMenuItems(menuItems),
    [menuItems],
  );

  const searchResults = useMemo(() => {
    if (searchQuery.trim() === "") return [];
    const query = searchQuery.toLowerCase();

    return searchableItems
      .filter((entry) => entry.label.toLowerCase().includes(query))
      .slice(0, 6);
  }, [searchableItems, searchQuery]);

  const breadcrumbItems = useMemo(() => {
    const segments = (pathname || "/").split("/").filter(Boolean);
    const items = [
      {
        key: "dashboard-home",
        label: "Dashboard",
        href: "/",
        icon: <HomeIcon className="h-4 w-4" aria-hidden="true" />,
      },
    ];

    if (segments.length === 0) {
      return items;
    }

    let builtPath = "";
    const dynamicSegments = segments;

    dynamicSegments.forEach((segment, index) => {
      builtPath += `/${segment}`;
      const menuMatch = searchableItems.find((entry) => {
        const entrySegments = entry.path.split("/").filter(Boolean);
        return entrySegments.includes(segment);
      });

      items.push({
        key: `${segment}-${index}`,
        label: menuMatch?.label ?? toTitleCase(segment),
        href: index === dynamicSegments.length - 1 ? undefined : builtPath,
      });
    });

    return items;
  }, [pathname, searchableItems]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="hidden sticky top-0 z-30 border-b border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 md:block">
      <div
        className="pointer-events-none absolute inset-y-0 -left-20 hidden w-20 border-b border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 lg:block"
        aria-hidden="true"
      />
      <div className="flex min-h-20 items-center justify-between bg-white px-4 py-3.5 dark:bg-neutral-950 lg:px-6">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            suppressHydrationWarning
            className="group relative rounded-xl bg-orange-500 p-2.5 text-white transition-transform duration-200 hover:scale-105 hover:bg-orange-600"
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? (
              <Bars3Icon className="h-5 w-5" />
            ) : (
              <XMarkIcon className="h-5 w-5" />
            )}
          </button>

          <div
            ref={searchRef}
            className="relative w-full max-w-[min(72vw,760px)]"
          >
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500 dark:text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Cari menu atau fitur..."
              suppressHydrationWarning
              className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-11 pr-4 text-sm text-neutral-900 outline-none transition-colors focus:border-orange-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-orange-400"
            />

            {isSearchFocused && searchResults.length > 0 ? (
              <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                <div className="max-h-72 overflow-y-auto p-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => {
                        router.push(result.path);
                        setSearchQuery("");
                        setIsSearchFocused(false);
                      }}
                      suppressHydrationWarning
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-neutral-700 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-300 dark:hover:bg-white/5 dark:hover:text-orange-300"
                    >
                      <MagnifyingGlassIcon className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                      <span className="flex-1">
                        {result.label}
                        {result.parent ? (
                          <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-500">
                            {result.parent}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative ml-4" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpen((current) => !current)}
            suppressHydrationWarning
            className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-2 transition-colors hover:bg-orange-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-white/5"
          >
            <Avatar name={profile.name} size="s2" className="h-9 w-9" />

            <div className="hidden text-left lg:block">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {profile.name}
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {profile.email || "Email belum tersedia"}
              </p>
            </div>

            <ChevronDownIcon
              className={cn(
                "h-4 w-4 text-neutral-500 transition-transform dark:text-neutral-400",
                isProfileMenuOpen ? "rotate-180" : "rotate-0",
              )}
            />
          </button>

          <AnimatePresence>
            {isProfileMenuOpen ? (
              <motion.div
                key="profile-popover"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 mt-2 w-72 origin-top-right overflow-hidden rounded-3xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="bg-linear-to-b from-orange-50/80 to-white px-4 pb-4 pt-5 dark:from-orange-500/10 dark:to-neutral-900">
                  <div className="flex items-center gap-3">
                    <Avatar name={profile.name} size="s1" className="h-9 w-9" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {profile.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-neutral-600 dark:text-neutral-400">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mx-4 h-px bg-neutral-200 dark:bg-neutral-800" />

                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onProfileClick?.();
                    }}
                    suppressHydrationWarning
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-orange-50 dark:hover:bg-white/5"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300">
                      <UserIcon className="h-4 w-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        Lihat Profil
                      </span>
                      <span className="block text-xs text-neutral-600 dark:text-neutral-400">
                        Buka detail akun dan pengaturan profil
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (isLoggingOut) return;
                      setIsProfileMenuOpen(false);
                      onLogout?.();
                    }}
                    disabled={isLoggingOut}
                    suppressHydrationWarning
                    className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                      <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {isLoggingOut ? "Memproses..." : "Keluar"}
                      </span>
                      <span className="block text-xs text-neutral-600 dark:text-neutral-400">
                        Akhiri sesi login saat ini
                      </span>
                    </span>
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-neutral-200/80 bg-white px-4 py-1.5 dark:border-neutral-800 dark:bg-neutral-950 lg:px-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
    </header>
  );
}

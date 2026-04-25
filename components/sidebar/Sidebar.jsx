import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Avatar from "@/components/avatar/Avatar";
import { useAuthProfileStore } from "@/lib/stores/auth-profile.store";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function toSet(value) {
  if (!value) return new Set();
  if (value instanceof Set) return new Set(value);
  if (Array.isArray(value)) return new Set(value);
  return new Set([value]);
}

function Sidebar({
  className = "",
  items = [],
  isCollapsed = false,
  logo,
  collapsedLogo,
  logoSrc = "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
  collapsedLogoSrc = "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
  logoAlt = "Application logo",
  activeKey,
  defaultActiveKey,
  onActiveChange,
  onLogout,
  onProfileClick,
  expandedKeys,
  defaultExpandedKeys = [],
  onExpandedChange,
  width = "100%",
  collapsedWidth = "92px",
  ariaLabel = "Sidebar navigation",
}) {
  const isActiveControlled = activeKey !== undefined;
  const isExpandedControlled = expandedKeys !== undefined;
  const popupRef = useRef(null);
  const triggerRef = useRef(null);
  const profile = useAuthProfileStore((state) => state.profile);

  const [openPopoverKey, setOpenPopoverKey] = useState(null);
  const [popoverPos, setPopoverPos] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedKey, setMobileExpandedKey] = useState(null);

  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey ?? items[0]?.key,
  );
  const [internalExpandedKeys, setInternalExpandedKeys] = useState(
    toSet(defaultExpandedKeys),
  );

  const resolvedActiveKey = isActiveControlled ? activeKey : internalActiveKey;
  const resolvedExpandedKeys = useMemo(
    () => (isExpandedControlled ? toSet(expandedKeys) : internalExpandedKeys),
    [expandedKeys, internalExpandedKeys, isExpandedControlled],
  );

  const resolvedLogoNode = isCollapsed
    ? (collapsedLogo ?? logo)
    : (logo ?? collapsedLogo);
  const resolvedLogoSrc = isCollapsed
    ? (collapsedLogoSrc ?? logoSrc)
    : (logoSrc ?? collapsedLogoSrc);

  const setActive = (key, item) => {
    if (!isActiveControlled) {
      setInternalActiveKey(key);
    }

    onActiveChange?.(key, item);
  };

  const setExpanded = (nextSet, item) => {
    if (!isExpandedControlled) {
      setInternalExpandedKeys(nextSet);
    }

    onExpandedChange?.(Array.from(nextSet), item);
  };

  const toggleExpanded = (key, item) => {
    const nextSet = new Set(resolvedExpandedKeys);

    if (nextSet.has(key)) {
      nextSet.delete(key);
    } else {
      nextSet.add(key);
    }

    setExpanded(nextSet, item);
  };

  const openCollapsedPopover = (event, item) => {
    const rect = event.currentTarget.getBoundingClientRect();

    setPopoverPos({
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });

    triggerRef.current = event.currentTarget;
    setOpenPopoverKey((current) => (current === item.key ? null : item.key));
  };

  const handleItemClick = (event, item) => {
    const hasChildren =
      Array.isArray(item.children) && item.children.length > 0;

    if (hasChildren) {
      if (isCollapsed) {
        openCollapsedPopover(event, item);
      } else {
        toggleExpanded(item.key, item);
      }

      setActive(item.key, item);
      return;
    }

    setActive(item.key, item);
    setOpenPopoverKey(null);
    setPopoverPos(null);
  };

  const handleChildClick = (parentItem, childItem) => {
    setActive(childItem.key, childItem);

    if (isCollapsed) {
      setOpenPopoverKey(null);
      setPopoverPos(null);
    }

    if (!isCollapsed && !resolvedExpandedKeys.has(parentItem.key)) {
      toggleExpanded(parentItem.key, parentItem);
    }
  };

  useEffect(() => {
    if (!isCollapsed || !openPopoverKey) return;

    const handleOutside = (event) => {
      const target = event.target;

      if (popupRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;

      setOpenPopoverKey(null);
      setPopoverPos(null);
    };

    document.addEventListener("pointerdown", handleOutside);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
    };
  }, [isCollapsed, openPopoverKey]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            {collapsedLogo ? (
              collapsedLogo
            ) : logo ? (
              logo
            ) : (
              <Image
                src={collapsedLogoSrc ?? logoSrc}
                alt={logoAlt}
                width={40}
                height={40}
                className="h-10 w-auto object-contain dark:brightness-110 dark:contrast-125"
              />
            )}
          </div>

          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((current) => !current)}
            suppressHydrationWarning
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          >
            {mobileOpen ? (
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed inset-x-0 top-16 bottom-0 flex flex-col border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
            >
              <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                {items.map((item) => {
                  const hasChildren =
                    Array.isArray(item.children) && item.children.length > 0;
                  const isActive = resolvedActiveKey === item.key;
                  const hasActiveChild = hasChildren
                    ? item.children.some((child) => child.key === resolvedActiveKey)
                    : false;
                  const showFilledActive = isActive || hasActiveChild;
                  const Icon = item.icon;
                  const isExpandedMobile = mobileExpandedKey === item.key;

                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        disabled={item.disabled}
                        onClick={(event) => {
                          if (hasChildren) {
                            setMobileExpandedKey((current) =>
                              current === item.key ? null : item.key,
                            );
                            setActive(item.key, item);
                            return;
                          }

                          handleItemClick(event, item);
                          setMobileOpen(false);
                          setMobileExpandedKey(null);
                        }}
                        suppressHydrationWarning
                        className={cn(
                          "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] transition-colors duration-150",
                          showFilledActive
                            ? "bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300"
                            : "text-neutral-700 hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-300 dark:hover:bg-white/5 dark:hover:text-orange-300",
                          item.disabled
                            ? "cursor-not-allowed text-neutral-400 dark:text-neutral-600"
                            : "cursor-pointer",
                        )}
                      >
                        {Icon ? (
                          <Icon
                            className={cn(
                              "h-5 w-5 shrink-0",
                              showFilledActive
                                ? "text-orange-600"
                                : "text-current",
                            )}
                            aria-hidden="true"
                          />
                        ) : null}

                        <span
                          className={cn(
                            "flex-1",
                            showFilledActive ? "font-semibold" : "font-medium",
                          )}
                        >
                          {item.label}
                        </span>

                        {hasChildren ? (
                          <ChevronRightIcon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-transform duration-200",
                              isExpandedMobile ? "rotate-90" : "rotate-0",
                            )}
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>

                      {hasChildren ? (
                        <AnimatePresence initial={false}>
                          {isExpandedMobile ? (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="ml-4 mt-1 border-l-2 border-neutral-300 pl-3 dark:border-neutral-700">
                                {item.children.map((child) => {
                                  const isChildActive = resolvedActiveKey === child.key;

                                  return (
                                    <button
                                      key={child.key}
                                      type="button"
                                      disabled={child.disabled}
                                      onClick={() => {
                                        handleChildClick(item, child);
                                        setMobileOpen(false);
                                        setMobileExpandedKey(null);
                                      }}
                                      suppressHydrationWarning
                                      className={cn(
                                        "flex min-h-10 w-full items-center rounded-lg px-3 text-left text-[13px] transition-colors duration-150",
                                        child.disabled
                                          ? "cursor-not-allowed text-neutral-400 dark:text-neutral-600"
                                          : isChildActive
                                            ? "font-semibold text-orange-600 dark:text-orange-300"
                                            : "font-medium text-neutral-700 hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-300 dark:hover:bg-white/5 dark:hover:text-orange-300",
                                      )}
                                    >
                                      <span className="truncate">{child.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      ) : null}
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-neutral-200 bg-white/95 p-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
                <div className="rounded-3xl border border-neutral-200 bg-neutral-50/90 p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
                  <div className="flex items-center gap-3">
                    <Avatar name={profile.name} size="s2" className="h-10 w-10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {profile.name}
                      </p>
                      <p className="truncate text-xs text-neutral-600 dark:text-neutral-400">
                        {profile.email || "Email belum tersedia"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        setMobileExpandedKey(null);
                        onProfileClick?.();
                      }}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-900 transition hover:bg-orange-50 hover:text-orange-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-white/5 dark:hover:text-orange-300"
                    >
                      <UserIcon className="h-4 w-4" aria-hidden="true" />
                      Profil
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        setMobileExpandedKey(null);
                        onLogout?.();
                      }}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
                    >
                      <ArrowRightStartOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
                      Keluar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="h-16 md:hidden" aria-hidden="true" />

      <motion.nav
        aria-label={ariaLabel}
        initial={false}
        animate={{ width: isCollapsed ? collapsedWidth : width }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "hidden w-full flex-col overflow-x-visible rounded-tr-4xl rounded-br-4xl border border-neutral-200/70 bg-white shadow-[0_8px_22px_rgba(16,24,40,0.08)] dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-[0_8px_22px_rgba(0,0,0,0.35)] md:sticky md:top-0 md:flex md:h-screen md:overflow-hidden",
          className,
        )}
      >
        {resolvedLogoNode || resolvedLogoSrc ? (
          <div className="flex h-24 w-full items-center justify-center bg-white px-4 dark:bg-neutral-950" aria-label={logoAlt}>
            {resolvedLogoNode ? (
              resolvedLogoNode
            ) : (
              <Image
                src={resolvedLogoSrc}
                alt={logoAlt}
                width={220}
                height={48}
                className={cn(
                  "block object-contain dark:brightness-110 dark:contrast-125",
                  isCollapsed ? "h-10 w-10" : "h-12 w-auto max-w-55",
                )}
              />
            )}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4 pt-1">
          {items.map((item) => {
            const hasChildren =
              Array.isArray(item.children) && item.children.length > 0;
            const isExpanded = resolvedExpandedKeys.has(item.key);
            const isActive = resolvedActiveKey === item.key;
            const hasActiveChild = hasChildren
              ? item.children.some((child) => child.key === resolvedActiveKey)
              : false;
            const showFilledActive = isActive || hasActiveChild;
            const Icon = item.icon;
            const rowTone = item.disabled
              ? "text-neutral-400 dark:text-neutral-600"
              : isActive || hasActiveChild
                ? "text-orange-600 dark:text-orange-300"
                : "text-neutral-700 dark:text-neutral-300";

            return (
              <div key={item.key} className="w-full">
                <motion.button
                  type="button"
                  disabled={item.disabled}
                  onClick={(event) => handleItemClick(event, item)}
                  suppressHydrationWarning
                  className={cn(
                    "group relative flex min-h-12 w-full items-center rounded-2xl text-left transition-colors duration-200",
                    isCollapsed ? "justify-center px-3" : "gap-3 px-4",
                    showFilledActive
                      ? "bg-orange-50 dark:bg-orange-500/20"
                      : "bg-transparent hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-white/5 dark:hover:text-orange-300",
                    item.disabled ? "cursor-not-allowed" : "cursor-pointer",
                    rowTone,
                  )}
                  whileHover={item.disabled ? undefined : { x: 2 }}
                  whileTap={item.disabled ? undefined : { scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 440, damping: 34 }}
                >
                  {Icon ? (
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        showFilledActive
                          ? "text-orange-600"
                          : "text-current",
                      )}
                      aria-hidden="true"
                    />
                  ) : null}

                  {!isCollapsed ? (
                    <span
                      className={cn(
                        "flex-1 truncate text-[14px] font-medium leading-5",
                        showFilledActive ? "font-semibold" : "font-medium",
                      )}
                    >
                      {item.label}
                    </span>
                  ) : null}

                  {hasChildren && !isCollapsed ? (
                    <span className="ml-2 shrink-0 text-current">
                      {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </span>
                  ) : null}
                </motion.button>

                {hasChildren && !isCollapsed ? (
                  <AnimatePresence initial={false}>
                    {isExpanded ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 mt-2 border-l-2 border-neutral-300 pl-4 dark:border-neutral-700">
                          {item.children.map((child) => {
                            const isChildActive = resolvedActiveKey === child.key;

                            return (
                              <motion.button
                                key={child.key}
                                type="button"
                                disabled={child.disabled}
                                onClick={() => handleChildClick(item, child)}
                                suppressHydrationWarning
                                className={cn(
                                  "flex min-h-12 w-full items-center rounded-xl px-4 text-left text-[14px] font-medium leading-5 transition-colors duration-150",
                                  child.disabled
                                    ? "cursor-not-allowed text-neutral-400 dark:text-neutral-600"
                                    : isChildActive
                                      ? "font-semibold text-orange-600 dark:text-orange-300"
                                      : "text-neutral-700 hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-300 dark:hover:bg-white/5 dark:hover:text-orange-300",
                                )}
                                whileHover={child.disabled ? undefined : { x: 2 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 440,
                                  damping: 34,
                                }}
                              >
                                <span className="truncate">{child.label}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                ) : null}

                {isCollapsed &&
                  hasChildren &&
                  openPopoverKey === item.key &&
                  popoverPos &&
                  createPortal(
                    <div
                      ref={popupRef}
                      style={{
                        left: popoverPos.left,
                        top: popoverPos.top,
                        transform: "translateY(-42%)",
                        zIndex: 9999,
                      }}
                      className="fixed min-w-55 rounded-2xl border border-neutral-200 bg-white p-2 shadow-[0_10px_30px_rgba(16,24,40,0.12)] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                    >
                      <ul className="space-y-1">
                        {item.children.map((child) => {
                          const isChildActive = resolvedActiveKey === child.key;

                          return (
                            <li key={child.key}>
                              <motion.button
                                type="button"
                                disabled={child.disabled}
                                onClick={() => handleChildClick(item, child)}
                                className={cn(
                                  "flex min-h-10 w-full items-center rounded-xl px-3 text-left text-[14px] transition-colors duration-150",
                                  child.disabled
                                    ? "cursor-not-allowed text-neutral-400 dark:text-neutral-600"
                                    : isChildActive
                                      ? "font-semibold text-orange-600 dark:text-orange-300"
                                      : "font-medium text-neutral-700 hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-300 dark:hover:bg-white/5 dark:hover:text-orange-300",
                                )}
                                whileHover={child.disabled ? undefined : { x: 2 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 440,
                                  damping: 34,
                                }}
                              >
                                <span className="truncate">{child.label}</span>
                                <ChevronRightIcon className="ml-auto h-4 w-4 text-neutral-500 dark:text-neutral-500" />
                              </motion.button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>,
                    typeof document !== "undefined" ? document.body : null,
                  )}
              </div>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
}

export default Sidebar;

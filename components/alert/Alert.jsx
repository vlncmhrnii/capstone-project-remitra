import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

const ALERT_TONE_MAP = {
  general: {
    container: "bg-orange-500 text-white border-transparent",
    icon: "text-white",
    title: "text-white",
    description: "text-white",
    close:
      "text-white/90 hover:bg-white/15 focus-visible:ring-orange-300",
  },
  info: {
    container: "bg-orange-50 text-neutral-900 border-transparent",
    icon: "text-orange-600",
    title: "text-neutral-900",
    description: "text-neutral-700",
    close:
      "text-neutral-500 hover:bg-black/5 focus-visible:ring-orange-300",
  },
  success: {
    container: "bg-emerald-50 text-neutral-900 border-transparent",
    icon: "text-emerald-600",
    title: "text-neutral-900",
    description: "text-neutral-700",
    close:
      "text-neutral-500 hover:bg-black/5 focus-visible:ring-emerald-300",
  },
  warning: {
    container: "bg-amber-50 text-neutral-900 border-transparent",
    icon: "text-amber-600",
    title: "text-neutral-900",
    description: "text-neutral-700",
    close:
      "text-neutral-500 hover:bg-black/5 focus-visible:ring-amber-300",
  },
  delete: {
    container: "bg-red-50 text-neutral-900 border-transparent",
    icon: "text-red-600",
    title: "text-neutral-900",
    description: "text-neutral-700",
    close:
      "text-neutral-500 hover:bg-black/5 focus-visible:ring-red-300",
  },
};

const ALERT_ICON_MAP = {
  general: ExclamationCircleIcon,
  info: ExclamationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  delete: XCircleIcon,
};

function Alert({
  className = "",
  closeLabel = "Tutup alert",
  description,
  duration = 5000,
  mode = "inline",
  onClose,
  offsetTop = 16,
  offsetRight = 16,
  showCloseButton = true,
  title,
  type = "info",
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [closeReason, setCloseReason] = useState(null);

  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Alert: prop 'title' wajib diisi.");
  }

  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Alert: prop 'description' wajib diisi.");
  }

  if (typeof duration !== "number" || Number.isNaN(duration) || duration < 0) {
    throw new Error("Alert: prop 'duration' harus angka >= 0.");
  }

  const toneConfig = ALERT_TONE_MAP[type] ?? ALERT_TONE_MAP.info;
  const Icon = ALERT_ICON_MAP[type] ?? ALERT_ICON_MAP.info;
  const isAbsolute = mode === "absolute";

  const positionStyle = useMemo(() => {
    if (!isAbsolute) {
      return undefined;
    }

    return {
      top: `max(${offsetTop}px, env(safe-area-inset-top))`,
      "--alert-offset-right": `${offsetRight}px`,
    };
  }, [isAbsolute, offsetRight, offsetTop]);

  useEffect(() => {
    if (!duration || duration <= 0 || !isVisible) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setCloseReason("timeout");
      setIsVisible(false);
    }, duration);

    return () => window.clearTimeout(timerId);
  }, [duration, isVisible, onClose]);

  const handleClose = () => {
    setCloseReason("manual");
    setIsVisible(false);
  };

  if (!shouldRender) {
    return null;
  }

  const motionTransition = isAbsolute
    ? { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
    : {
        type: "spring",
        stiffness: 420,
        damping: 32,
        mass: 0.7,
      };

  const initialMotion = isAbsolute
    ? { opacity: 0, x: 72, scale: 0.98 }
    : { opacity: 0, y: 10, scale: 0.98 };

  const animateMotion = isAbsolute
    ? { opacity: 1, x: 0, scale: 1 }
    : { opacity: 1, y: 0, scale: 1 };

  const exitMotion = isAbsolute
    ? { opacity: 0, x: 72, scale: 0.98 }
    : { opacity: 0, y: 8, scale: 0.98 };

  return (
    <AnimatePresence
      onExitComplete={() => {
        setShouldRender(false);
        if (typeof onClose === "function" && closeReason) {
          onClose(closeReason);
        }
      }}
    >
      {isVisible ? (
        <motion.div
          initial={initialMotion}
          animate={animateMotion}
          exit={exitMotion}
          transition={motionTransition}
          className={cn(
            "w-full rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-3",
            "grid grid-cols-[auto_1fr_auto] items-start gap-2.5",
            isAbsolute &&
              "fixed z-120000 left-1/2 -translate-x-1/2 w-[calc(100vw-1rem)] max-w-105 sm:left-auto sm:translate-x-0 sm:w-[min(64vw,400px)] sm:max-w-none sm:right-(--alert-offset-right)",
            toneConfig.container,
            className,
          )}
          style={positionStyle}
          role="status"
          aria-live="polite"
        >
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
            <Icon
              className={cn("h-6 w-6", toneConfig.icon)}
              aria-hidden="true"
            />
          </span>

          <div className="min-w-0">
            <h4
              className={cn("text-md m-0 font-bold wrap-anywhere", toneConfig.title)}
            >
              {title}
            </h4>
            <p
              className={cn("text-sm py-0.5 wrap-anywhere", toneConfig.description)}
            >
              {description}
            </p>
          </div>

          {showCloseButton ? (
            <button
              type="button"
              onClick={handleClose}
              aria-label={closeLabel}
              className={cn(
                "-mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2",
                toneConfig.close,
              )}
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default Alert;

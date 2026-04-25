import { forwardRef, useEffect, useRef } from "react";
import { CheckIcon, MinusIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

const SIZE_MAP = {
  medium: {
    box: "h-5 w-5 rounded-[6px]",
    icon: "h-3.5 w-3.5 stroke-[2.75]",
    helperOffset: "ml-7",
  },
  small: {
    box: "h-4 w-4 rounded-[5px]",
    icon: "h-3 w-3 stroke-[2.5]",
    helperOffset: "ml-6",
  },
};

// Used only when visualState prop is supplied (static preview mode)
const STATIC_STATE_MAP = {
  default: {
    box: "border-2 border-orange-300 bg-white dark:border-orange-400 dark:bg-zinc-800",
    icon: null,
    iconColor: "",
  },
  hover: {
    box: "border-2 border-orange-500 bg-white dark:bg-zinc-800",
    icon: null,
    iconColor: "",
  },
  focus: {
    box: "border-2 border-orange-500 bg-white shadow-[0_0_0_4px_rgb(255_237_213)] dark:bg-zinc-800 dark:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]",
    icon: null,
    iconColor: "",
  },
  selected: {
    box: "border-2 border-orange-500 bg-orange-400 dark:border-orange-400 dark:bg-orange-500",
    icon: "check",
    iconColor: "text-white",
  },
  indeterminate: {
    box: "border-2 border-orange-500 bg-orange-400 dark:border-orange-400 dark:bg-orange-500",
    icon: "minus",
    iconColor: "text-white",
  },
  disabled: {
    box: "border-2 border-neutral-200 bg-neutral-50 dark:border-zinc-700 dark:bg-zinc-800",
    icon: "check",
    iconColor: "text-neutral-300 dark:text-zinc-500",
  },
  error: {
    box: "border-2 border-red-500 bg-white dark:border-red-400 dark:bg-zinc-800",
    icon: "check",
    iconColor: "text-red-500 dark:text-red-400",
  },
};

const BOX_BASE =
  "shrink-0 flex items-center justify-center transition-all duration-150";

const Checkbox = forwardRef(function Checkbox({
  checked,
  defaultChecked = false,
  indeterminate = false,
  disabled = false,
  error = false,
  visualState,
  label,
  labelPosition = "right",
  onChange,
  id,
  name,
  size = "medium",
  value,
  helperText,
}, ref) {
  const inputRef = useRef(null);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : undefined;
  const sizeConfig = SIZE_MAP[size] ?? SIZE_MAP.medium;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  // ── Static / preview mode ─────────────────────────────────────────────────
  if (visualState) {
    const cfg = STATIC_STATE_MAP[visualState] ?? STATIC_STATE_MAP.default;
    const isDisabled = visualState === "disabled";
    const isError = visualState === "error";
    const labelColor = isDisabled
      ? "text-neutral-400 dark:text-zinc-500"
      : isError
        ? "text-red-500 dark:text-red-400"
        : "text-neutral-800 dark:text-zinc-100";

    const box = (
      <span className={cn(BOX_BASE, sizeConfig.box, cfg.box)} aria-hidden="true">
        {cfg.icon === "check" && (
          <CheckIcon
            className={cn(sizeConfig.icon, cfg.iconColor)}
          />
        )}
        {cfg.icon === "minus" && (
          <MinusIcon
            className={cn(sizeConfig.icon, cfg.iconColor)}
          />
        )}
      </span>
    );

    if (!label) return box;

    return (
      <span className="inline-flex items-center gap-2">
        {labelPosition === "left" && (
          <span className={cn("text-sm select-none font-semibold", labelColor)}>{label}</span>
        )}
        {box}
        {labelPosition !== "left" && (
          <span className={cn("text-sm select-none font-semibold", labelColor)}>{label}</span>
        )}
      </span>
    );
  }

  // ── Interactive mode ──────────────────────────────────────────────────────
  const labelColor = disabled
    ? "text-neutral-400 dark:text-zinc-500"
    : error
      ? "text-red-500 dark:text-red-400"
      : "text-neutral-800 dark:text-zinc-100";

  const labelEl = label ? (
    <span className={cn("text-sm select-none font-semibold", labelColor)}>{label}</span>
  ) : null;

  const activeIcon = indeterminate ? "minus" : checked ? "check" : null;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className={cn(
          "group/cb inline-flex items-center gap-2",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        {label && labelPosition === "left" && labelEl}

        <input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          suppressHydrationWarning
          type="checkbox"
          id={id}
          name={name}
          value={value}
          {...(isControlled ? { checked: isChecked } : { defaultChecked })}
          disabled={disabled}
          onChange={onChange ?? (() => {})}
          className="sr-only peer/cb"
        />

        <motion.span
          aria-hidden="true"
          tabIndex={-1}
          style={{ pointerEvents: "none" }}
          whileTap={disabled ? undefined : { scale: 0.9 }}
          transition={{ type: "spring", stiffness: 520, damping: 30 }}
          className={cn(
            BOX_BASE,
            sizeConfig.box,
            // Base state
            error
              ? "border-2 border-red-500 bg-white dark:border-red-400 dark:bg-zinc-800"
              : disabled
                ? "border-2 border-neutral-200 bg-neutral-50 dark:border-zinc-700 dark:bg-zinc-800"
                : "border-2 border-orange-300 bg-white dark:border-orange-400 dark:bg-zinc-800",
            // Hover: only when not disabled, not error
            !disabled &&
              !error &&
              "group-hover/cb:border-orange-500 dark:group-hover/cb:border-orange-400",
            // Focus
            !disabled &&
              "peer-focus/cb:border-orange-500 peer-focus/cb:shadow-[0_0_0_4px_rgb(255_237_213)] peer-focus-visible/cb:border-orange-500 peer-focus-visible/cb:shadow-[0_0_0_4px_rgb(255_237_213)] dark:peer-focus/cb:border-orange-400 dark:peer-focus/cb:shadow-[0_0_0_4px_rgba(251,146,60,0.18)] dark:peer-focus-visible/cb:border-orange-400 dark:peer-focus-visible/cb:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]",
            // Checked (non-error, non-disabled)
            !error &&
              !disabled &&
              "peer-checked/cb:border-orange-500 peer-checked/cb:bg-orange-400 dark:peer-checked/cb:border-orange-400 dark:peer-checked/cb:bg-orange-500",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {activeIcon === "minus" && (
              <motion.span
                key="minus"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
              >
                <MinusIcon
                  className={cn(
                    sizeConfig.icon,
                    disabled ? "text-neutral-300 dark:text-zinc-500" : "text-white",
                  )}
                />
              </motion.span>
            )}
            {activeIcon === "check" && (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
              >
                <CheckIcon
                  className={cn(
                    sizeConfig.icon,
                    disabled
                      ? "text-neutral-300 dark:text-zinc-500"
                      : error
                        ? "text-red-500 dark:text-red-400"
                        : "text-white",
                  )}
                />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>

        {label && labelPosition !== "left" && labelEl}
      </label>

      {helperText && (
        <p
          className={cn(
            "text-sm",
            sizeConfig.helperOffset,
            error
              ? "text-red-500"
              : "text-neutral-500",
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Checkbox;

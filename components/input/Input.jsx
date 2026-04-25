import { forwardRef, useEffect, useId, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

const INPUT_SIZE_MAP = {
  large: {
    wrapper: "min-h-14 px-4 gap-2.5",
    text: "text-[16px] leading-5 font-[300] placeholder:font-[300] tracking-normal",
    icon: "h-5 w-5",
  },
  medium: {
    wrapper: "min-h-12 px-4 gap-2",
    text: "text-[14px] leading-5 font-[400] placeholder:font-[400] tracking-normal",
    icon: "h-4 w-4",
  },
};

const INPUT_STATE_MAP = {
  default: {
      field: "border-neutral-300 bg-white dark:border-zinc-600 dark:bg-zinc-800",
      label: "text-neutral-800 dark:text-zinc-100",
      helper: "text-neutral-500 dark:text-zinc-400",
      icon: "text-neutral-400 dark:text-zinc-500",
      input: "text-neutral-900 placeholder:text-neutral-400 dark:text-zinc-100 dark:placeholder:text-zinc-500",
      focusWithin: "focus-within:border-orange-500 dark:focus-within:border-orange-400",
  },
  field: {
      field: "border-neutral-300 bg-white dark:border-zinc-600 dark:bg-zinc-800",
      label: "text-neutral-800 dark:text-zinc-100",
      helper: "text-neutral-500 dark:text-zinc-400",
      icon: "text-neutral-400 dark:text-zinc-500",
      input: "text-neutral-900 placeholder:text-neutral-400 dark:text-zinc-100 dark:placeholder:text-zinc-500",
      focusWithin: "focus-within:border-orange-500 dark:focus-within:border-orange-400",
  },
  focus: {
      field: "border-orange-500 bg-white dark:border-orange-400 dark:bg-zinc-800",
      label: "text-neutral-800 dark:text-zinc-100",
      helper: "text-orange-600 dark:text-orange-400",
      icon: "text-orange-500 dark:text-orange-400",
      input: "text-neutral-900 placeholder:text-neutral-400 dark:text-zinc-100 dark:placeholder:text-zinc-500",
    focusWithin: "",
  },
  info: {
      field: "border-cyan-500 bg-white dark:border-cyan-400 dark:bg-zinc-800",
      label: "text-neutral-800 dark:text-zinc-100",
      helper: "text-cyan-500 dark:text-cyan-400",
      icon: "text-cyan-500 dark:text-cyan-400",
      input: "text-neutral-900 placeholder:text-neutral-500 dark:text-zinc-100 dark:placeholder:text-zinc-500",
    focusWithin: "",
  },
  disabled: {
      field: "border-neutral-200 bg-neutral-100 dark:border-zinc-700 dark:bg-zinc-800",
      label: "text-neutral-400 dark:text-zinc-500",
      helper: "text-neutral-400 dark:text-zinc-500",
      icon: "text-neutral-400 dark:text-zinc-600",
      input: "text-neutral-400 placeholder:text-neutral-400 dark:text-zinc-600 dark:placeholder:text-zinc-700",
    focusWithin: "",
  },
  success: {
      field: "border-emerald-500 bg-white dark:border-emerald-400 dark:bg-zinc-800",
      label: "text-neutral-800 dark:text-zinc-100",
      helper: "text-emerald-600 dark:text-emerald-400",
      icon: "text-emerald-500 dark:text-emerald-400",
      input: "text-neutral-900 placeholder:text-neutral-500 dark:text-zinc-100 dark:placeholder:text-zinc-500",
    focusWithin: "",
  },
  warning: {
      field: "border-amber-500 bg-white dark:border-amber-400 dark:bg-zinc-800",
      label: "text-neutral-800 dark:text-zinc-100",
      helper: "text-amber-600 dark:text-amber-400",
      icon: "text-amber-500 dark:text-amber-400",
      input: "text-neutral-900 placeholder:text-neutral-500 dark:text-zinc-100 dark:placeholder:text-zinc-500",
    focusWithin: "",
  },
  error: {
      field: "border-red-500 bg-white dark:border-red-400 dark:bg-zinc-800",
      label: "text-neutral-800 dark:text-zinc-100",
      helper: "text-red-600 dark:text-red-400",
      icon: "text-red-500 dark:text-red-400",
      input: "text-neutral-900 placeholder:text-neutral-500 dark:text-zinc-100 dark:placeholder:text-zinc-500",
    focusWithin: "",
  },
};

const Input = forwardRef(function Input(
  {
    variant = "input",
    className = "",
    defaultValue,
    disabled = false,
    helperText = "Helper Text",
    showHelperTextAlways = false,
    id,
    inputClassName = "",
    label = "Label",
    leftIcon: LeftIcon,
    name,
    onBlur,
    onChange,
    onFocus,
    placeholder = "Placeholder",
    required = false,
    rightIcon: RightIcon,
    rows = 3,
    size = "medium",
    state = "default",
    type = "text",
    value,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const shakeControls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();
  const inputId = id ?? generatedId;
  const isControlled = value !== undefined;
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const alwaysShowHelperText =
    !disabled &&
    (showHelperTextAlways || state === "success" || state === "warning" || state === "error");
  const showHelperText = Boolean(helperText) && (alwaysShowHelperText || isFocused);

  const stateKey = disabled ? "disabled" : state;
  const resolvedStateKey =
    !disabled && isFocused && (stateKey === "default" || stateKey === "field")
      ? "focus"
      : stateKey;
  const stateConfig =
    INPUT_STATE_MAP[resolvedStateKey] ?? INPUT_STATE_MAP.default;
  const sizeConfig = INPUT_SIZE_MAP[size] ?? INPUT_SIZE_MAP.medium;
  const isTextarea = variant === "textarea";
  const isPasswordField = type === "password";
  const resolvedInputType =
    isPasswordField && isPasswordVisible ? "text" : type;

  useEffect(() => {
    if (resolvedStateKey === "error" && !disabled && !prefersReducedMotion) {
      void shakeControls.start({
        x: [0, -6, 6, -4, 4, -2, 2, 0],
        transition: { duration: 0.35, ease: "easeOut" },
      });
      return;
    }

    void shakeControls.set({ x: 0 });
  }, [resolvedStateKey, disabled, prefersReducedMotion, shakeControls]);

  const handleFocus = (event) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const handleChange = (event) => {
    onChange?.(event);
  };

  const handlePasswordMouseDown = (event) => {
    event.preventDefault();
  };

  const handlePasswordToggle = () => {
    if (disabled) return;
    setIsPasswordVisible((current) => !current);
  };

  return (
    <div className={cn("inline-grid w-full gap-1", className)}>
      <label
        htmlFor={inputId}
        className={cn("b4 font-semibold!", stateConfig.label)}
      >
        {label}
        {required ? (
          <span className="text-red-500" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>

      <motion.div
        animate={shakeControls}
        className={cn(
          "flex w-full border-2 transition-colors duration-200",
          isTextarea
            ? "items-start rounded-3xl px-4 py-2.5"
            : "items-center rounded-full",
          !isTextarea && sizeConfig.wrapper,
          stateConfig.field,
          stateConfig.focusWithin,
        )}
      >
        {!isTextarea && LeftIcon ? (
          <LeftIcon
            className={cn("shrink-0", sizeConfig.icon, stateConfig.icon)}
            aria-hidden="true"
          />
        ) : null}

        {isTextarea ? (
          <textarea
            {...props}
            suppressHydrationWarning
            ref={ref}
            id={inputId}
            name={name}
            rows={rows}
            required={required}
            aria-required={required}
            aria-multiline="true"
            disabled={disabled}
            placeholder={placeholder}
            {...(isControlled ? { value } : { defaultValue })}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={cn(
              "w-full min-w-0 bg-transparent text-[14px] leading-5 font-normal placeholder:font-normal outline-none resize-y",
              stateConfig.input,
              inputClassName,
            )}
          />
        ) : (
          <input
            {...props}
            suppressHydrationWarning
            ref={ref}
            id={inputId}
            name={name}
            type={resolvedInputType}
            required={required}
            aria-required={required}
            disabled={disabled}
            placeholder={placeholder}
            {...(isControlled ? { value } : { defaultValue })}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={cn(
              "w-full min-w-0 bg-transparent py-1 outline-none",
              sizeConfig.text,
              stateConfig.input,
              inputClassName,
            )}
          />
        )}

        {!isTextarea && isPasswordField ? (
          <button
            type="button"
            suppressHydrationWarning
            onMouseDown={handlePasswordMouseDown}
            onClick={handlePasswordToggle}
            disabled={disabled}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className={cn(
              "shrink-0 rounded-full p-0.5 transition-colors",
              disabled
                ? "cursor-not-allowed"
                : "cursor-pointer hover:bg-neutral-100 dark:hover:bg-zinc-700",
            )}
          >
            {isPasswordVisible ? (
              <EyeSlashIcon
                className={cn(sizeConfig.icon, stateConfig.icon)}
                aria-hidden="true"
              />
            ) : (
              <EyeIcon
                className={cn(sizeConfig.icon, stateConfig.icon)}
                aria-hidden="true"
              />
            )}
          </button>
        ) : !isTextarea && RightIcon ? (
          <RightIcon
            className={cn("shrink-0", sizeConfig.icon, stateConfig.icon)}
            aria-hidden="true"
          />
        ) : null}
      </motion.div>

      {showHelperText ? (
        <p className={cn("text-sm text-right", stateConfig.helper)}>{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;

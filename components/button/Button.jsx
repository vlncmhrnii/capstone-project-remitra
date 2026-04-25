import { motion } from "framer-motion";
import "./Button.css";

const BUTTON_SIZE_MAP = {
  large: {
    container: "min-h-12 gap-2 px-6 text-[16px] leading-5",
    iconOnly: "h-12 w-12",
    icon: "h-5 w-5",
    spinner: "button-spinner--lg",
  },
  medium: {
    container: "min-h-10 gap-2 px-5 text-[14px] leading-4",
    iconOnly: "h-10 w-10",
    icon: "h-4 w-4",
    spinner: "button-spinner--md",
  },
  small: {
    container: "min-h-8 gap-1.5 px-4 text-[12px] leading-4",
    iconOnly: "h-8 w-8",
    icon: "h-3 w-3",
    spinner: "button-spinner--sm",
  },
};

const BUTTON_VARIANT_MAP = {
  primary: {
    interactive:
      "border-transparent bg-orange-500 text-white hover:bg-orange-600",
    hover: "border-transparent bg-orange-600 text-white",
    focus:
      "border-transparent bg-orange-500 text-white outline outline-2 outline-offset-2 outline-orange-300",
    focusVisible:
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300",
    disabled: "border-transparent bg-neutral-200 text-neutral-500",
    loading: "border-transparent bg-orange-500 text-white",
  },
  secondary: {
    interactive:
      "border-orange-500 bg-white text-orange-600 hover:bg-orange-50",
    hover:
      "border-orange-500 bg-orange-50 text-orange-600",
    focus:
      "border-orange-500 bg-white text-orange-600 outline outline-2 outline-offset-2 outline-orange-300",
    focusVisible:
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300",
    disabled:
      "border-neutral-300 bg-white text-neutral-400",
    loading:
      "border-orange-500 bg-white text-orange-600",
  },
  tertiary: {
    interactive:
      "border-transparent bg-transparent text-orange-600 hover:bg-orange-50",
    hover: "border-transparent bg-orange-50 text-orange-600",
    focus:
      "border-transparent bg-transparent text-orange-600 shadow-[0_0_0_3px_rgb(254_215_170)]",
    focusVisible:
      "focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgb(254_215_170)]",
    disabled: "border-transparent bg-transparent text-neutral-400",
    loading: "border-transparent bg-transparent text-orange-600",
  },
  danger: {
    interactive:
      "border-red-300 bg-red-100 text-red-700 hover:bg-red-50",
    hover:
      "border-red-300 bg-red-50 text-red-700",
    focus:
      "border-red-300 bg-red-50 text-red-700 outline outline-2 outline-offset-2 outline-red-300",
    focusVisible:
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300",
    disabled: "border-red-100 bg-white text-neutral-400",
    loading:
      "border-red-300 bg-red-50 text-red-700",
  },
};

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Button({
  children,
  text = "Button",
  className = "",
  disabled = false,
  iconOnly = false,
  icon: Icon,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  loading = false,
  size = "medium",
  type = "button",
  variant = "primary",
  visualState = "default",
  ...props
}) {
  const sizeConfig = BUTTON_SIZE_MAP[size] ?? BUTTON_SIZE_MAP.medium;
  const variantConfig =
    BUTTON_VARIANT_MAP[variant] ?? BUTTON_VARIANT_MAP.primary;
  const isLoading = loading || visualState === "loading";
  const isDisabled = disabled || visualState === "disabled";
  const isNonInteractive = isDisabled || isLoading;
  const enableInteractiveMotion =
    !isNonInteractive && visualState === "default";

  let visualClassName = variantConfig.interactive;
  if (isLoading) {
    visualClassName = variantConfig.loading;
  } else if (isDisabled) {
    visualClassName = variantConfig.disabled;
  } else if (visualState === "focus") {
    visualClassName = variantConfig.focus;
  } else if (visualState === "hover") {
    visualClassName = variantConfig.hover;
  }

  const baseClassName = cn(
    "inline-flex shrink-0 select-none items-center justify-center rounded-full border whitespace-nowrap",
    "font-bold tracking-normal transition-colors duration-200",
    isNonInteractive ? "cursor-not-allowed" : "cursor-pointer",
    !isDisabled && variantConfig.focusVisible,
    iconOnly ? sizeConfig.iconOnly : sizeConfig.container,
    visualClassName,
    className,
  );

  const iconClassName = sizeConfig.icon;
  const label = children ?? text;
  const accessibleLabel =
    props["aria-label"] ?? (typeof label === "string" ? label : undefined);

  const content = isLoading ? (
    <span
      className={cn(
        "button-spinner",
        `button-spinner--${variant}`,
        sizeConfig.spinner,
      )}
      aria-hidden="true"
    />
  ) : (
    <>
      {iconOnly && Icon ? (
        <Icon className={iconClassName} aria-hidden="true" />
      ) : null}
      {!iconOnly && LeftIcon ? (
        <LeftIcon className={iconClassName} aria-hidden="true" />
      ) : null}
      {!iconOnly ? <span>{label}</span> : null}
      {!iconOnly && RightIcon ? (
        <RightIcon className={iconClassName} aria-hidden="true" />
      ) : null}
    </>
  );

  return (
    <motion.button
      {...props}
      suppressHydrationWarning
      type={type}
      disabled={isNonInteractive}
      aria-busy={isLoading}
      aria-disabled={isNonInteractive}
      aria-label={isLoading || iconOnly ? accessibleLabel : props["aria-label"]}
      className={baseClassName}
      whileHover={enableInteractiveMotion ? { y: -2, scale: 1.02 } : undefined}
      whileTap={enableInteractiveMotion ? { scale: 0.95 } : undefined}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.6 }}
    >
      {content}
    </motion.button>
  );
}

export default Button;

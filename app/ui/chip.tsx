'use client'

type ChipSize = "sm" | "md" | "lg";
type ChipVariant = "filled" | "soft" | "outlined";

type ChipProps = React.HTMLAttributes<HTMLDivElement> & {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  startIconBg?: string;
  startIconColor?: string;
  fullHeightStartIcon?: boolean;
  size?: ChipSize;
  variant?: ChipVariant;
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const sizeClassMap: Record<ChipSize, { root: string; icon: string; text: string }> = {
  sm: {
    root: "h-[30px] rounded-[10px] px-3",
    icon: "h-[18px] w-[18px]",
    text: "text-[14px]",
  },
  md: {
    root: "h-[36px] rounded-[12px] px-3.5",
    icon: "h-[20px] w-[20px]",
    text: "text-[15px]",
  },
  lg: {
    root: "h-[42px] rounded-[14px] px-4",
    icon: "h-[22px] w-[22px]",
    text: "text-[16px]",
  },
};

const variantClassMap: Record<ChipVariant, string> = {
  filled: "",
  soft: "border border-black/6",
  outlined: "border border-black/18 bg-transparent",
};

export default function Chip({
  startIcon,
  endIcon,
  startIconBg,
  startIconColor,
  fullHeightStartIcon = false,
  size = "md",
  variant = "filled",
  className,
  style,
  children,
  ...rest
}: ChipProps) {
  const sizeClasses = sizeClassMap[size];

  const mergedStyle: React.CSSProperties = {
    backgroundColor:
      variant === "filled"
        ? "var(--theme-chip-bg)"
        : variant === "soft"
          ? "color-mix(in srgb, var(--theme-chip-bg) 74%, white 26%)"
          : undefined,
    color: "var(--theme-chip-text)",
    ...style,
  };

  return (
    <div
      className={cn(
        "inline-flex items-center overflow-hidden font-bold tracking-[-0.02em]",
        sizeClasses.root,
        variantClassMap[variant],
        className,
      )}
      style={mergedStyle}
      {...rest}
    >
      {startIcon ? (
        <span
          className={cn(
            "shrink-0 items-center justify-center",
            fullHeightStartIcon
              ? "flex h-full aspect-square"
              : "flex h-[24px] w-[24px] rounded-[8px]",
          )}
          style={{
            backgroundColor: startIconBg,
            color: startIconColor,
          }}
        >
          <span className={cn("flex items-center justify-center", sizeClasses.icon)}>{startIcon}</span>
        </span>
      ) : null}

      <span className={cn("whitespace-nowrap", sizeClasses.text, startIcon ? "ml-3" : "")}>{children}</span>

      {endIcon ? (
        <span className="ml-2 inline-flex h-[14px] w-[14px] items-center justify-center">
          {endIcon}
        </span>
      ) : null}
    </div>
  );
}

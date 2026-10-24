import { cn } from "@/lib/utils";

export const NAOMILEARN_LOGO_SRC = "/assets/aistudio/image_da4a217c.png";

interface NaomiLearnLogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  variant?: "default" | "light";
  className?: string;
}

/**
 * Precision vector emblem combining Python's interlocking arcs with
 * an AI neural nexus sparkle.
 */
export function NaomiLearnEmblem({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="nl-emblem-bg"
          x1="0"
          y1="0"
          x2="36"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient
          id="nl-py-blue"
          x1="6"
          y1="6"
          x2="26"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient
          id="nl-py-gold"
          x1="10"
          y1="14"
          x2="30"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Deep Navy Squircle Base */}
      <rect width="36" height="36" rx="9" fill="url(#nl-emblem-bg)" />
      <rect width="36" height="36" rx="9" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />

      {/* Python Upper Arc (Cyan to Royal Blue) */}
      <path
        d="M17.5 7C13 7 10 9.8 10 13.5V16H15.5V18H7.5C7.5 18 6.5 18 6.5 13.5C6.5 9 10.5 6 17.5 6C21.8 6 24 8 24.5 11H19.5C19 8.8 17.5 7 17.5 7Z"
        fill="url(#nl-py-blue)"
      />
      <circle cx="12" cy="10.5" r="1.25" fill="#FFFFFF" />

      {/* Python Lower Arc (Warm Gold to Amber) */}
      <path
        d="M18.5 29C23 29 26 26.2 26 22.5V20H20.5V18H28.5C28.5 18 29.5 18 29.5 22.5C29.5 27 25.5 30 18.5 30C14.2 30 12 28 11.5 25H16.5C17 27.2 18.5 29 18.5 29Z"
        fill="url(#nl-py-gold)"
      />
      <circle cx="24" cy="25.5" r="1.25" fill="#FFFFFF" />

      {/* AI Intelligence Nexus Sparkle */}
      <path
        d="M18 13L19 16.5L22.5 17.5L19 18.5L18 22L17 18.5L13.5 17.5L17 16.5L18 13Z"
        fill="#38BDF8"
      />
      <circle cx="18" cy="17.5" r="1" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * Official NaomiLearn AI Academy brand logo component.
 * Features an ultra-crisp academic-tech emblem and balanced typography lockup.
 */
export function NaomiLearnLogo({
  size = "md",
  showWordmark = true,
  variant = "default",
  className,
}: NaomiLearnLogoProps) {
  const iconBoxSize = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const titleSizeClasses = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";
  const subtitleSizeClasses =
    size === "sm" ? "text-[9.5px]" : size === "lg" ? "text-xs" : "text-[10px]";

  // Compact icon-only display used when sidebar is collapsed or in tight mobile spots
  if (!showWordmark) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-xs select-none",
          iconBoxSize,
          className,
        )}
      >
        <NaomiLearnEmblem />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5 select-none",
        variant === "light" && "rounded-xl bg-slate-900/40 px-2 py-1 ring-1 ring-white/10",
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-xs",
          iconBoxSize,
        )}
      >
        <NaomiLearnEmblem />
      </span>

      <span className="flex flex-col leading-none text-left">
        <span
          className={cn(
            "font-extrabold tracking-tight font-sans text-foreground",
            titleSizeClasses,
            variant === "light" && "text-white",
          )}
        >
          NaomiLearn
        </span>
        <span
          className={cn(
            "font-bold tracking-[0.14em] uppercase text-primary mt-1 flex items-center gap-1",
            subtitleSizeClasses,
            variant === "light" && "text-sky-300",
          )}
        >
          AI Academy
        </span>
      </span>
    </span>
  );
}

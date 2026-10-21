import { cn } from "@/lib/utils";

export const NAOMILEARN_LOGO_SRC = "/assets/aistudio/image_da4a217c.png";

interface NaomiLearnLogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  variant?: "default" | "light";
  className?: string;
}

/**
 * Official NaomiLearn — Python & AI Academy brand logo component.
 * Uses the uploaded brand lockup (/assets/aistudio/image_da4a217c.png) while
 * preserving its original aspect ratio, blue-and-yellow N emblem, wordmark, and tagline.
 */
export function NaomiLearnLogo({
  size = "md",
  showWordmark = true,
  variant = "default",
  className,
}: NaomiLearnLogoProps) {
  // Compact icon-only crop used only when the desktop sidebar is collapsed into a narrow icon rail
  if (!showWordmark) {
    const iconBoxSize = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center overflow-hidden rounded-lg bg-white select-none",
          variant === "light" && "px-0.5 py-0.5 shadow-2xs ring-1 ring-white/20",
          iconBoxSize,
          className,
        )}
      >
        <img
          src={NAOMILEARN_LOGO_SRC}
          alt="NaomiLearn — Python & AI Academy"
          width={982}
          height={375}
          decoding="async"
          className="h-full w-auto max-w-none object-contain object-left block"
        />
      </span>
    );
  }

  const heightClasses =
    size === "sm" ? "h-8 sm:h-9" : size === "lg" ? "h-11 sm:h-13 lg:h-14" : "h-9 sm:h-11 lg:h-12";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center select-none",
        variant === "light" && "rounded-xl bg-white px-3 py-1.5 shadow-xs ring-1 ring-white/20",
        className,
      )}
    >
      <img
        src={NAOMILEARN_LOGO_SRC}
        alt="NaomiLearn — Python & AI Academy"
        width={982}
        height={375}
        decoding="async"
        className={cn(
          heightClasses,
          "w-auto aspect-[982/375] object-contain object-left block",
          variant === "default" && "mix-blend-multiply",
        )}
      />
    </span>
  );
}

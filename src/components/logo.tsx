import { Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";

const logoFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
});

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizes = {
    sm: {
      icon: "h-5 w-5",
      text: "text-base",
      badge: "h-4 px-1.5 text-[10px]",
      flag: "h-2.5 w-3.5",
    },
    md: {
      icon: "h-6 w-6",
      text: "text-lg sm:text-xl",
      badge: "h-5 px-1.5 text-[11px]",
      flag: "h-3 w-4",
    },
    lg: {
      icon: "h-8 w-8",
      text: "text-2xl",
      badge: "h-6 px-2 text-xs",
      flag: "h-3.5 w-5",
    },
  }[size];

  return (
    <span
      className={cn(
        "inline-flex select-none items-center gap-2",
        logoFont.className,
        className,
      )}
    >
      {/* Emblem SVG: Perisai + Radar Scan */}
      <svg
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0 text-foreground", sizes.icon)}
        aria-hidden="true"
      >
        <path
          d="M14 2.5L4.5 6.5V13.5C4.5 19.6 8.55 24.85 14 26.5C19.45 24.85 23.5 19.6 23.5 13.5V6.5L14 2.5Z"
          className="fill-foreground/10 stroke-foreground"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M10.2 14.2L12.8 16.8L18 11.2"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark: ANTISCAM + (FLAG ID) */}
      <span className="inline-flex items-center gap-1.5">
        <span
          className={cn(
            "font-bold text-foreground uppercase leading-none tracking-[-0.04em]",
            sizes.text,
          )}
        >
          ANTISCAM
        </span>

        <svg
          viewBox="0 0 16 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "shrink-0 rounded-[2px] border border-black/10",
            sizes.flag,
          )}
          aria-hidden="true"
        >
          <rect width="16" height="6" fill="#E11D48" />
          <rect y="6" width="16" height="6" fill="#FFFFFF" />
        </svg>
      </span>
    </span>
  );
}

import Image from "next/image";
import Link from "next/link";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

/**
 * The brand's logo, linking home. Uses the wordmark image when the brand has
 * one (on a light chip over dark backgrounds), otherwise a monogram and name.
 */
export function Logo({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  if (brand.wordmark) {
    return (
      <Link
        href="/"
        aria-label={`${brand.name} home`}
        className={cn(
          "inline-flex items-center",
          inverse && "rounded-full bg-bg px-4 py-2",
          className,
        )}
      >
        <Image
          src={brand.wordmark.src}
          width={brand.wordmark.width}
          height={brand.wordmark.height}
          alt={brand.name}
          priority
          className="h-7 w-auto sm:h-8"
        />
      </Link>
    );
  }
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5", className)}
      aria-label={`${brand.name} home`}
    >
      {brand.logoSrc ? (
        <Image src={brand.logoSrc} alt="" width={36} height={36} className="h-9 w-auto" />
      ) : (
        <span
          aria-hidden
          className={cn(
            "font-heading flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold italic",
            inverse ? "bg-accent text-accent-fg" : "bg-primary text-primary-fg",
          )}
        >
          {brand.monogram}
        </span>
      )}
      <span className="font-heading text-lg font-medium leading-none tracking-tight">
        {brand.name}
      </span>
    </Link>
  );
}

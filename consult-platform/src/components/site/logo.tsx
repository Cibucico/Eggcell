import Image from "next/image";
import Link from "next/link";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

export function Logo({ inverse = false, className }: { inverse?: boolean; className?: string }) {
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

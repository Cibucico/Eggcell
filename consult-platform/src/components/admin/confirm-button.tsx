"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A submit button that asks before a destructive action goes ahead. */
export function ConfirmButton({
  message,
  children,
  className,
}: {
  message: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-brand border border-danger/40 px-3 text-sm font-semibold text-danger hover:bg-danger/5",
        className,
      )}
    >
      {children}
    </button>
  );
}

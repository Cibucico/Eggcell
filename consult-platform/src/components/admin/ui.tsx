import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminHeader({
  title,
  intro,
  action,
}: {
  title: string;
  intro?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {intro && <p className="mt-1 max-w-2xl text-sm text-muted">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function Notice({
  tone = "success",
  children,
}: {
  tone?: "success" | "error";
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "mb-6 rounded-brand border px-4 py-3 text-sm",
        tone === "success"
          ? "border-success/30 bg-success/10 text-success"
          : "border-danger/30 bg-danger/10 text-danger",
      )}
    >
      {children}
    </p>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-brand border border-line bg-bg", className)}>{children}</div>;
}

export const inputClass =
  "w-full rounded-brand border border-line bg-bg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/** Standard query-string feedback used by admin pages after a redirect. */
export function Feedback({ query }: { query: Record<string, string | string[] | undefined> }) {
  if (query.saved) return <Notice>Saved.</Notice>;
  if (query.deleted) return <Notice>Deleted.</Notice>;
  if (query.error === "self") return <Notice tone="error">You cannot remove your own admin access.</Notice>;
  if (query.error === "in-use") {
    return (
      <Notice tone="error">
        This cannot be deleted because people have already bought or joined it. Unpublish it instead.
      </Notice>
    );
  }
  if (query.error === "title") return <Notice tone="error">Enter a title first.</Notice>;
  if (query.error) return <Notice tone="error">That change could not be saved. Please check the details and try again.</Notice>;
  return null;
}

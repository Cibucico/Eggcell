"use client";

import { useEffect, useRef } from "react";
import { buttonClass } from "@/components/ui/button";

/** Posts the signed payment form to PayFast as soon as the page loads. */
export function PayfastRedirect({ action, fields }: { action: string; fields: [string, string][] }) {
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    form.current?.submit();
  }, []);
  return (
    <form ref={form} action={action} method="post">
      {fields.map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" className={buttonClass("primary", "lg")}>
        Continue to PayFast
      </button>
    </form>
  );
}

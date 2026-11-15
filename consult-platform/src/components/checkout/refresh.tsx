"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Re-checks the order every few seconds while the payment confirmation is on its way. */
export function AwaitingPayment() {
  const router = useRouter();
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (tries >= 20) return;
    const timer = setTimeout(() => {
      router.refresh();
      setTries((n) => n + 1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [tries, router]);

  return (
    <p className="mt-4 text-sm text-muted" role="status">
      {tries >= 20
        ? "This is taking longer than usual. Your order will update automatically once the payment is confirmed; you can safely leave this page."
        : "Checking for confirmation…"}
    </p>
  );
}

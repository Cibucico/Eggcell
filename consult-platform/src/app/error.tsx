"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="container-page flex flex-1 flex-col items-center justify-center py-28 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-4 text-4xl font-semibold">This page could not be loaded</h1>
      <p className="mt-4 max-w-md text-muted">
        Please try again. If the problem continues, contact us and quote reference{" "}
        {error.digest ?? "unknown"}.
      </p>
      <div className="mt-8">
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}

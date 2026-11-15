"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { Slide } from "@/lib/blocks";
import { cn } from "@/lib/utils";
import { BlockView } from "./blocks";

/**
 * Plays a lesson one screen at a time, like a storyboard. `finish` is shown
 * on the last screen (the "mark complete" button, or a prompt to enrol).
 */
export function LessonPlayer({ slides, finish }: { slides: Slide[]; finish: ReactNode }) {
  const [index, setIndex] = useState(0);
  const top = useRef<HTMLDivElement>(null);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  const go = (next: number) => {
    setIndex(next);
    top.current?.scrollIntoView({ block: "start" });
    top.current?.focus({ preventScroll: true });
  };

  if (!slide) {
    return (
      <div>
        <p className="text-muted">This lesson has no content yet.</p>
        <div className="mt-8">{finish}</div>
      </div>
    );
  }

  return (
    <div ref={top} tabIndex={-1} className="scroll-mt-24 outline-none">
      {slides.length > 1 && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span>
              Screen {index + 1} of {slides.length}
            </span>
          </div>
          <div
            className="mt-2 flex gap-1.5"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={slides.length}
            aria-valuenow={index + 1}
            aria-label="Progress through this lesson"
          >
            {slides.map((_, i) => (
              <span
                key={i}
                className={cn("h-1.5 flex-1 rounded-full", i <= index ? "bg-primary" : "bg-line")}
              />
            ))}
          </div>
        </div>
      )}

      <section key={index} aria-live="polite" className="min-h-64">
        {slide.title && <h2 className="mb-6 text-2xl font-semibold sm:text-3xl">{slide.title}</h2>}
        <div className="space-y-6">
          {slide.blocks.map((block, i) => (
            <BlockView key={i} block={block} />
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <Button variant="outline" onClick={() => go(index - 1)} disabled={index === 0}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </Button>
        {isLast ? (
          finish
        ) : (
          <Button onClick={() => go(index + 1)}>
            Next
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { CheckCircle2, ChevronDown, Lightbulb, PencilLine, RotateCw, TriangleAlert, XCircle } from "lucide-react";
import { useState } from "react";
import { Markdown } from "@/components/ui/markdown";
import { videoEmbedUrl, type Block } from "@/lib/blocks";
import { cn } from "@/lib/utils";

type Content = Exclude<Block, { type: "slide" }>;

export function BlockView({ block }: { block: Content }) {
  switch (block.type) {
    case "text":
      return <Markdown text={block.markdown} className="prose-brand text-lg" />;
    case "video":
      return <VideoBlock url={block.url} caption={block.caption} />;
    case "image":
      return (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.url} alt={block.alt} loading="lazy" className="w-full rounded-brand border border-line" />
          {block.caption && <figcaption className="mt-2 text-sm text-muted">{block.caption}</figcaption>}
        </figure>
      );
    case "callout":
      return <Callout tone={block.tone} title={block.title} text={block.text} />;
    case "reveal":
      return <Reveal intro={block.intro} items={block.items} />;
    case "flashcards":
      return <Flashcards intro={block.intro} cards={block.cards} />;
    case "quiz":
      return <Quiz {...block} />;
    case "exercise":
      return (
        <div className="rounded-brand border-2 border-dashed border-accent/60 bg-accent/5 p-6">
          <p className="eyebrow flex items-center gap-2">
            <PencilLine className="h-4 w-4" aria-hidden />
            Your turn
          </p>
          <h3 className="mt-2 text-xl font-semibold">{block.title}</h3>
          <Markdown text={block.text} className="prose-brand mt-3" />
        </div>
      );
    case "embed":
      return (
        <div>
          <iframe
            src={block.url}
            title={block.title}
            height={block.height}
            loading="lazy"
            allow="fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full rounded-brand border border-line bg-surface"
          />
          <p className="mt-2 text-sm text-muted">{block.title}</p>
        </div>
      );
  }
}

function VideoBlock({ url, caption }: { url: string; caption: string }) {
  const embed = videoEmbedUrl(url);
  return (
    <figure>
      <div className="aspect-video overflow-hidden rounded-brand border border-line bg-deep">
        {embed ? (
          <iframe
            src={embed}
            title={caption || "Lesson video"}
            loading="lazy"
            allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full"
          />
        ) : (
          <video src={url} controls preload="metadata" className="h-full w-full" />
        )}
      </div>
      {caption && <figcaption className="mt-2 text-sm text-muted">{caption}</figcaption>}
    </figure>
  );
}

const calloutStyles = {
  tip: { icon: Lightbulb, label: "Tip", cls: "border-primary/30 bg-primary/5" },
  important: { icon: TriangleAlert, label: "Important", cls: "border-accent/60 bg-accent/10" },
  example: { icon: PencilLine, label: "Example", cls: "border-line bg-surface" },
} as const;

function Callout({ tone, title, text }: { tone: keyof typeof calloutStyles; title: string; text: string }) {
  const { icon: Icon, label, cls } = calloutStyles[tone];
  return (
    <aside className={cn("flex gap-4 rounded-brand border p-5", cls)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
      <div>
        <p className="font-semibold">{title || label}</p>
        <Markdown text={text} className="prose-brand mt-1 text-sm [&_p:last-child]:mb-0" />
      </div>
    </aside>
  );
}

function Reveal({ intro, items }: { intro: string; items: { title: string; text: string }[] }) {
  return (
    <div>
      {intro && <p className="mb-4 text-muted">{intro}</p>}
      <div className="space-y-3">
        {items.map((item) => (
          <details key={item.title} className="group rounded-brand border border-line bg-bg">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold [&::-webkit-details-marker]:hidden">
              {item.title}
              <ChevronDown
                className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="border-t border-line px-5 py-4">
              <Markdown text={item.text} className="prose-brand [&_p:last-child]:mb-0" />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function Flashcards({ intro, cards }: { intro: string; cards: { front: string; back: string }[] }) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  return (
    <div>
      {intro && <p className="mb-4 text-muted">{intro}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => {
          const isFlipped = Boolean(flipped[i]);
          return (
            <button
              key={card.front}
              type="button"
              aria-pressed={isFlipped}
              onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
              className={cn(
                "flex min-h-40 flex-col justify-between rounded-brand border p-5 text-left transition-colors",
                isFlipped ? "border-primary bg-primary text-primary-fg" : "border-line bg-surface hover:border-primary",
              )}
            >
              <span className={cn(isFlipped ? "text-sm leading-relaxed" : "font-heading text-xl font-semibold")}>
                {isFlipped ? card.back : card.front}
              </span>
              <span className="mt-4 flex items-center gap-1.5 text-xs opacity-70">
                <RotateCw className="h-3.5 w-3.5" aria-hidden />
                {isFlipped ? "Show term" : "Show meaning"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Quiz({
  question,
  options,
  correctIndex,
  explanation,
}: {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const answered = choice !== null;
  const correct = choice === correctIndex;
  return (
    <fieldset className="rounded-brand border border-line bg-bg p-6">
      <legend className="eyebrow px-2">Knowledge check</legend>
      <p className="text-lg font-semibold">{question}</p>
      <div className="mt-4 space-y-2.5">
        {options.map((option, i) => {
          const showCorrect = answered && i === correctIndex;
          const showWrong = answered && i === choice && !correct;
          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => setChoice(i)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-brand border px-4 py-3 text-left text-sm transition-colors",
                !answered && "border-line hover:border-primary hover:bg-surface",
                answered && !showCorrect && !showWrong && "border-line opacity-60",
                showCorrect && "border-success bg-success/10 font-medium",
                showWrong && "border-danger bg-danger/10",
              )}
            >
              {option}
              {showCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden />}
              {showWrong && <XCircle className="h-5 w-5 shrink-0 text-danger" aria-hidden />}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {answered && (
          <div className="mt-4 rounded-brand bg-surface p-4 text-sm">
            <p className="font-semibold">{correct ? "Correct." : "Not quite."}</p>
            {explanation && <p className="mt-1 text-muted">{explanation}</p>}
            {!correct && (
              <button
                type="button"
                onClick={() => setChoice(null)}
                className="mt-3 font-semibold text-primary underline-offset-4 hover:underline"
              >
                Try again
              </button>
            )}
          </div>
        )}
      </div>
    </fieldset>
  );
}

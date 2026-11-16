"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Block, BlockType } from "@/lib/blocks";
import { cn } from "@/lib/utils";
import { inputClass } from "./ui";

/**
 * Screen-by-screen lesson editor. Blocks are kept in order; a "New screen"
 * block starts the next screen of the storyboard. The result is posted as
 * JSON in a hidden field and validated again on the server.
 */

const BLOCK_TYPES: { type: BlockType; label: string; help: string }[] = [
  { type: "slide", label: "New screen", help: "Starts a new screen with its own heading." },
  { type: "text", label: "Text", help: "Paragraphs, headings, lists and links." },
  { type: "video", label: "Video", help: "A YouTube or Vimeo link, or a video file link." },
  { type: "image", label: "Image", help: "A picture with an optional caption." },
  { type: "callout", label: "Highlight box", help: "A tip, warning or example that stands out." },
  { type: "reveal", label: "Click to reveal", help: "Panels the learner opens one at a time." },
  { type: "flashcards", label: "Flashcards", help: "Cards that turn over to show a meaning." },
  { type: "quiz", label: "Knowledge check", help: "A multiple-choice question with feedback." },
  { type: "exercise", label: "Exercise", help: "A task for the learner to do themselves." },
  { type: "embed", label: "Embedded activity", help: "A published Storyline, Rise or other web package." },
];

function emptyBlock(type: BlockType): Block {
  switch (type) {
    case "slide":
      return { type, title: "" };
    case "text":
      return { type, markdown: "" };
    case "video":
      return { type, url: "", caption: "" };
    case "image":
      return { type, url: "", alt: "", caption: "" };
    case "callout":
      return { type, tone: "tip", title: "", text: "" };
    case "reveal":
      return { type, intro: "", items: [{ title: "", text: "" }] };
    case "flashcards":
      return { type, intro: "", cards: [{ front: "", back: "" }] };
    case "quiz":
      return { type, question: "", options: ["", ""], correctIndex: 0, explanation: "" };
    case "exercise":
      return { type, title: "Exercise", text: "" };
    case "embed":
      return { type, url: "", title: "Interactive activity", height: 600 };
  }
}

type Keyed = { key: number; block: Block };

export function BlockBuilder({ initial }: { initial: Block[] }) {
  const [items, setItems] = useState<Keyed[]>(() => initial.map((block, key) => ({ key, block })));
  const [nextKey, setNextKey] = useState(initial.length);

  const update = (key: number, block: Block) =>
    setItems((list) => list.map((item) => (item.key === key ? { key, block } : item)));
  const remove = (key: number) => setItems((list) => list.filter((item) => item.key !== key));
  const move = (index: number, by: number) =>
    setItems((list) => {
      const target = index + by;
      if (target < 0 || target >= list.length) return list;
      const copy = [...list];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  const add = (type: BlockType) => {
    setItems((list) => [...list, { key: nextKey, block: emptyBlock(type) }]);
    setNextKey((k) => k + 1);
  };

  // Screen number for each "New screen" block, by position.
  const screenNumbers = items.map(
    (_, i) => items.slice(0, i + 1).filter((item) => item.block.type === "slide").length,
  );
  return (
    <div>
      <input type="hidden" name="blocks" value={JSON.stringify(items.map((item) => item.block))} />
      {items.length === 0 && (
        <p className="rounded-brand border border-dashed border-line px-5 py-8 text-center text-sm text-muted">
          This lesson is empty. Start with “New screen”, then add content to it.
        </p>
      )}
      <ol className="space-y-4">
        {items.map(({ key, block }, index) => {
          const meta = BLOCK_TYPES.find((t) => t.type === block.type)!;
          const isSlide = block.type === "slide";
          return (
            <li
              key={key}
              className={cn(
                "rounded-brand border bg-bg",
                isSlide ? "border-primary/50 bg-primary/5" : "ml-4 border-line sm:ml-8",
              )}
            >
              <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {isSlide ? `Screen ${screenNumbers[index]}` : meta.label}
                </p>
                <div className="flex items-center gap-1">
                  <IconButton label="Move up" onClick={() => move(index, -1)} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </IconButton>
                  <IconButton
                    label="Move down"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </IconButton>
                  <IconButton label="Remove" onClick={() => remove(key)} danger>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </IconButton>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <BlockFields block={block} onChange={(b) => update(key, b)} />
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-brand border border-line bg-surface p-4">
        <p className="mb-3 text-sm font-semibold">Add to this lesson</p>
        <div className="flex flex-wrap gap-2">
          {BLOCK_TYPES.map((t) => (
            <button
              key={t.type}
              type="button"
              title={t.help}
              onClick={() => add(t.type)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-brand border px-3 text-sm font-medium",
                t.type === "slide"
                  ? "border-primary bg-primary text-primary-fg"
                  : "border-line bg-bg hover:border-primary",
              )}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-brand disabled:opacity-30",
        danger ? "text-danger hover:bg-danger/10" : "text-muted hover:bg-surface hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
    </label>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Labeled label={label}>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </Labeled>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <Labeled label={label}>
      <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className={`${inputClass} resize-y`} />
    </Labeled>
  );
}

const smallButton =
  "inline-flex h-8 items-center gap-1.5 rounded-brand border border-line px-2.5 text-xs font-semibold hover:border-primary";

function BlockFields({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  switch (block.type) {
    case "slide":
      return <Text label="Screen heading" value={block.title} onChange={(title) => onChange({ ...block, title })} />;
    case "text":
      return (
        <>
          <Area label="Text" rows={6} value={block.markdown} onChange={(markdown) => onChange({ ...block, markdown })} />
          <p className="text-xs text-muted">
            Formatting: **bold**, *italic*, lines starting with “- ” for bullets, “## ” for a heading,
            and [link text](https://…) for links.
          </p>
        </>
      );
    case "video":
      return (
        <>
          <Text label="Video link" placeholder="https://www.youtube.com/watch?v=…" value={block.url} onChange={(url) => onChange({ ...block, url })} />
          <Text label="Caption (optional)" value={block.caption} onChange={(caption) => onChange({ ...block, caption })} />
        </>
      );
    case "image":
      return (
        <>
          <Text label="Image link" placeholder="https://…" value={block.url} onChange={(url) => onChange({ ...block, url })} />
          <Text label="Description for screen readers" value={block.alt} onChange={(alt) => onChange({ ...block, alt })} />
          <Text label="Caption (optional)" value={block.caption} onChange={(caption) => onChange({ ...block, caption })} />
        </>
      );
    case "callout":
      return (
        <>
          <Labeled label="Style">
            <select
              value={block.tone}
              onChange={(e) => onChange({ ...block, tone: e.target.value as typeof block.tone })}
              className={inputClass}
            >
              <option value="tip">Tip</option>
              <option value="important">Important</option>
              <option value="example">Example</option>
            </select>
          </Labeled>
          <Text label="Heading (optional)" value={block.title} onChange={(title) => onChange({ ...block, title })} />
          <Area label="Text" value={block.text} onChange={(text) => onChange({ ...block, text })} />
        </>
      );
    case "reveal":
      return (
        <>
          <Text label="Instruction (optional)" value={block.intro} onChange={(intro) => onChange({ ...block, intro })} />
          {block.items.map((item, i) => (
            <fieldset key={i} className="space-y-2 rounded-brand border border-line p-3">
              <legend className="px-1 text-xs font-semibold text-muted">Panel {i + 1}</legend>
              <Text
                label="Heading"
                value={item.title}
                onChange={(title) => onChange({ ...block, items: block.items.map((x, j) => (j === i ? { ...x, title } : x)) })}
              />
              <Area
                label="Hidden text"
                value={item.text}
                onChange={(text) => onChange({ ...block, items: block.items.map((x, j) => (j === i ? { ...x, text } : x)) })}
              />
              {block.items.length > 1 && (
                <button type="button" className={smallButton} onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}>
                  Remove panel
                </button>
              )}
            </fieldset>
          ))}
          {block.items.length < 12 && (
            <button type="button" className={smallButton} onClick={() => onChange({ ...block, items: [...block.items, { title: "", text: "" }] })}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add panel
            </button>
          )}
        </>
      );
    case "flashcards":
      return (
        <>
          <Text label="Instruction (optional)" value={block.intro} onChange={(intro) => onChange({ ...block, intro })} />
          {block.cards.map((card, i) => (
            <fieldset key={i} className="grid gap-2 rounded-brand border border-line p-3 sm:grid-cols-2">
              <legend className="px-1 text-xs font-semibold text-muted">Card {i + 1}</legend>
              <Text
                label="Front"
                value={card.front}
                onChange={(front) => onChange({ ...block, cards: block.cards.map((x, j) => (j === i ? { ...x, front } : x)) })}
              />
              <Text
                label="Back"
                value={card.back}
                onChange={(back) => onChange({ ...block, cards: block.cards.map((x, j) => (j === i ? { ...x, back } : x)) })}
              />
              {block.cards.length > 1 && (
                <div>
                  <button type="button" className={smallButton} onClick={() => onChange({ ...block, cards: block.cards.filter((_, j) => j !== i) })}>
                    Remove card
                  </button>
                </div>
              )}
            </fieldset>
          ))}
          {block.cards.length < 12 && (
            <button type="button" className={smallButton} onClick={() => onChange({ ...block, cards: [...block.cards, { front: "", back: "" }] })}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add card
            </button>
          )}
        </>
      );
    case "quiz":
      return (
        <>
          <Area label="Question" rows={2} value={block.question} onChange={(question) => onChange({ ...block, question })} />
          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-medium">Answers (select the correct one)</legend>
            {block.options.map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  aria-label={`Answer ${i + 1} is correct`}
                  checked={block.correctIndex === i}
                  onChange={() => onChange({ ...block, correctIndex: i })}
                  className="h-4 w-4 accent-[var(--brand-primary)]"
                />
                <input
                  aria-label={`Answer ${i + 1}`}
                  value={option}
                  onChange={(e) => onChange({ ...block, options: block.options.map((x, j) => (j === i ? e.target.value : x)) })}
                  className={inputClass}
                />
                {block.options.length > 2 && (
                  <button
                    type="button"
                    aria-label={`Remove answer ${i + 1}`}
                    className="text-danger"
                    onClick={() =>
                      onChange({
                        ...block,
                        options: block.options.filter((_, j) => j !== i),
                        correctIndex: block.correctIndex === i ? 0 : block.correctIndex > i ? block.correctIndex - 1 : block.correctIndex,
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
            ))}
            {block.options.length < 6 && (
              <button type="button" className={smallButton} onClick={() => onChange({ ...block, options: [...block.options, ""] })}>
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Add answer
              </button>
            )}
          </fieldset>
          <Area label="Explanation shown after answering (optional)" rows={2} value={block.explanation} onChange={(explanation) => onChange({ ...block, explanation })} />
        </>
      );
    case "exercise":
      return (
        <>
          <Text label="Heading" value={block.title} onChange={(title) => onChange({ ...block, title })} />
          <Area label="Instructions" value={block.text} onChange={(text) => onChange({ ...block, text })} />
        </>
      );
    case "embed":
      return (
        <>
          <Text label="Link to the published activity" placeholder="https://…/story.html" value={block.url} onChange={(url) => onChange({ ...block, url })} />
          <Text label="Title" value={block.title} onChange={(title) => onChange({ ...block, title })} />
          <Labeled label="Height in pixels">
            <input
              type="number"
              min={200}
              max={1200}
              value={block.height}
              onChange={(e) => onChange({ ...block, height: Number(e.target.value) || 600 })}
              className={inputClass}
            />
          </Labeled>
          <p className="text-xs text-muted">
            Publish from Storyline or Rise for “Web”, upload the folder to any web host, and paste
            the link to its story.html or index.html here.
          </p>
        </>
      );
  }
}

import { z } from "zod";

/**
 * Lesson content model.
 *
 * A lesson is an ordered list of blocks. A `slide` block starts a new screen,
 * so a lesson plays like a storyboard: one screen at a time with Next and
 * Back. Lessons with no `slide` blocks are shown as a single page.
 *
 * Content built in an authoring tool such as Articulate Storyline or Rise can
 * be published for web, hosted anywhere, and dropped in with an `embed` block.
 */

const text = (max: number) => z.string().trim().max(max);
const httpUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => /^https:\/\//i.test(v), "Must be an https:// link");

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("slide"), title: text(160).default("") }),
  z.object({ type: z.literal("text"), markdown: text(20000) }),
  z.object({
    type: z.literal("video"),
    url: httpUrl,
    caption: text(300).default(""),
  }),
  z.object({
    type: z.literal("image"),
    url: httpUrl,
    alt: text(300).default(""),
    caption: text(300).default(""),
  }),
  z.object({
    type: z.literal("callout"),
    tone: z.enum(["tip", "important", "example"]).default("tip"),
    title: text(160).default(""),
    text: text(4000),
  }),
  z.object({
    type: z.literal("reveal"),
    intro: text(600).default(""),
    items: z.array(z.object({ title: text(200).min(1), text: text(4000) })).min(1).max(12),
  }),
  z.object({
    type: z.literal("flashcards"),
    intro: text(600).default(""),
    cards: z.array(z.object({ front: text(300).min(1), back: text(1200).min(1) })).min(1).max(12),
  }),
  z.object({
    type: z.literal("quiz"),
    question: text(600).min(1),
    options: z.array(text(300).min(1)).min(2).max(6),
    correctIndex: z.number().int().min(0).max(5),
    explanation: text(2000).default(""),
  }),
  z.object({
    type: z.literal("exercise"),
    title: text(160).default("Exercise"),
    text: text(4000),
  }),
  z.object({
    type: z.literal("embed"),
    url: httpUrl,
    title: text(160).default("Interactive activity"),
    height: z.number().int().min(200).max(1200).default(600),
  }),
]);

export const blocksSchema = z
  .array(blockSchema)
  .max(200)
  .refine(
    (blocks) => blocks.every((b) => b.type !== "quiz" || b.correctIndex < b.options.length),
    "A quiz's correct answer must be one of its options",
  );

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];

export type Slide = { title: string; blocks: Exclude<Block, { type: "slide" }>[] };

/** Groups blocks into screens. Content before the first `slide` block forms its own screen. */
export function toSlides(blocks: Block[]): Slide[] {
  const slides: Slide[] = [];
  for (const block of blocks) {
    if (block.type === "slide") {
      slides.push({ title: block.title, blocks: [] });
    } else {
      if (slides.length === 0) slides.push({ title: "", blocks: [] });
      slides[slides.length - 1].blocks.push(block);
    }
  }
  return slides.filter((s) => s.blocks.length > 0 || s.title);
}

/** Reads blocks from the database, dropping anything malformed instead of failing the page. */
export function parseBlocks(value: unknown): Block[] {
  if (!Array.isArray(value)) return [];
  const out: Block[] = [];
  for (const item of value) {
    const parsed = blockSchema.safeParse(item);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

/** Turns a watch link into an embeddable player address. Returns null for plain video files. */
export function videoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.match(/^\/(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (host === "player.vimeo.com" || host === "youtube-nocookie.com") return url;
    return null;
  } catch {
    return null;
  }
}

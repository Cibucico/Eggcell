import type { ReactNode } from "react";

/**
 * Small, safe renderer for the formatting lesson authors need: headings
 * (## and ###), paragraphs, bullet and numbered lists, **bold**, *italic* and
 * [links](https://...). It builds React elements directly and never injects
 * HTML, so author text cannot run scripts.
 */
export function Markdown({ text, className }: { text: string; className?: string }) {
  return <div className={className ?? "prose-brand"}>{renderBlocks(text)}</div>;
}

function renderBlocks(text: string): ReactNode[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) out.push(<p key={out.length}>{inline(paragraph.join(" "))}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    const items = list.items.map((item, i) => <li key={i}>{inline(item)}</li>);
    out.push(
      list.ordered ? (
        <ol key={out.length} className="mb-4 list-decimal pl-5">
          {items}
        </ol>
      ) : (
        <ul key={out.length}>{items}</ul>
      ),
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    const bullet = line.match(/^[-*]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (line === "") {
      flushParagraph();
      flushList();
    } else if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      out.push(<h3 key={out.length}>{inline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      out.push(<h2 key={out.length}>{inline(line.slice(3))}</h2>);
    } else if (bullet || numbered) {
      flushParagraph();
      const ordered = Boolean(numbered);
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]);
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return out;
}

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;

function inline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (link) {
      return (
        <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer">
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

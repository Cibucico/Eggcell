import { ArrowRight, Clock, PlayCircle } from "lucide-react";
import Link from "next/link";
import type { ToolkitCategoryInfo } from "@/config/brand";
import type { ToolkitArticleSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

/** One palette colour per toolkit area, so the three are easy to tell apart. */
export const categoryColor: Record<string, string> = {
  operations: "var(--brand-palette-2)",
  marketing: "var(--brand-palette-3)",
  finance: "var(--brand-palette-4)",
};

export function ArticleMeta({ article, className }: { article: ToolkitArticleSummary; className?: string }) {
  return (
    <span className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted", className)}>
      {article.reading_minutes > 0 && (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {article.reading_minutes} min read
        </span>
      )}
      {article.has_video && (
        <span className="inline-flex items-center gap-1">
          <PlayCircle className="h-3.5 w-3.5" aria-hidden />
          Video
        </span>
      )}
    </span>
  );
}

/** A numbered list of the articles in one area: the order is the suggested reading order. */
export function ArticleSteps({
  category,
  articles,
}: {
  category: ToolkitCategoryInfo;
  articles: ToolkitArticleSummary[];
}) {
  if (articles.length === 0) {
    return <p className="text-sm text-muted">New guides for this area are on their way.</p>;
  }
  return (
    <ol className="space-y-3">
      {articles.map((article, i) => (
        <li key={article.id}>
          <Link
            href={`/toolkit/${category.slug}/${article.slug}`}
            className="card-lift group flex items-start gap-4 rounded-brand border border-line bg-bg p-5"
          >
            <span
              aria-hidden
              className="font-heading flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-medium text-white"
              style={{ background: categoryColor[category.slug] }}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-semibold leading-snug">{article.title}</span>
              {article.summary && <span className="mt-1 block text-sm text-muted">{article.summary}</span>}
              <ArticleMeta article={article} className="mt-2" />
            </span>
            <ArrowRight
              className="mt-2 h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ol>
  );
}

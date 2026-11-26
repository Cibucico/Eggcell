import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand, TOOLKIT_CATEGORIES, toolkitCategory } from "@/config/brand";
import { CallToAction } from "@/components/site/cards";
import { BlockView } from "@/components/training/blocks";
import { ArticleMeta } from "@/components/toolkit/parts";
import { Eyebrow, Section } from "@/components/ui/primitives";
import { getToolkitArticle, getToolkitArticles } from "@/lib/data/content";

export async function generateStaticParams() {
  const articles = await getToolkitArticles();
  if (articles.length === 0) return [{ category: "operations", slug: "not-available" }];
  return articles.map((a) => ({ category: a.category, slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/toolkit/[category]/[slug]">): Promise<Metadata> {
  const article = await getToolkitArticle((await params).slug);
  if (!article) return {};
  return { title: article.title, description: article.summary };
}

export default async function ToolkitArticlePage({ params }: PageProps<"/toolkit/[category]/[slug]">) {
  if (!brand.features.toolkit) notFound();
  const { category: categorySlug, slug } = await params;
  const category = toolkitCategory(categorySlug);
  const article = await getToolkitArticle(slug);
  if (!category || !article || article.category !== category.slug) notFound();

  // Next guide: the next one in this area, or the first guide of the next area.
  const all = await getToolkitArticles();
  const ordered = TOOLKIT_CATEGORIES.flatMap((c) => all.filter((a) => a.category === c.slug));
  const next = ordered[ordered.findIndex((a) => a.id === article.id) + 1];

  return (
    <>
      <Section className="pt-12 sm:pt-16">
        <article className="mx-auto max-w-3xl">
          <Link
            href={`/toolkit/${category.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {category.label}
          </Link>
          <Eyebrow className="mt-8">{`${brand.toolkit?.label ?? "Toolkit"} · ${category.label}`}</Eyebrow>
          <h1 className="mt-4 text-4xl font-medium leading-tight tracking-tight sm:text-5xl">{article.title}</h1>
          {article.summary && <p className="mt-4 text-xl leading-relaxed text-muted">{article.summary}</p>}
          <ArticleMeta article={{ ...article, has_video: article.blocks.some((b) => b.type === "video") }} className="mt-4 text-sm" />
          <div className="mt-10 space-y-6 border-t border-line pt-10">
            {article.blocks.map((block, i) =>
              block.type === "slide" ? (
                block.title ? (
                  <h2 key={i} className="pt-4 text-2xl font-medium tracking-tight sm:text-3xl">
                    {block.title}
                  </h2>
                ) : null
              ) : (
                <BlockView key={i} block={block} />
              ),
            )}
          </div>
          {next && (
            <Link
              href={`/toolkit/${next.category}/${next.slug}`}
              className="card-lift group mt-14 flex items-center justify-between gap-4 rounded-brand border border-line bg-surface p-6"
            >
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wider text-muted">Next guide</span>
                <span className="mt-1 block text-lg font-semibold">{next.title}</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          )}
        </article>
      </Section>
      <CallToAction title="Ready to talk it _through_?" text="Book a consultation and we will help you apply this to your business." />
    </>
  );
}

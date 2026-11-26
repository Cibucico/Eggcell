import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { brand, TOOLKIT_CATEGORIES } from "@/config/brand";
import { CallToAction } from "@/components/site/cards";
import { ArticleSteps, categoryColor } from "@/components/toolkit/parts";
import { PageHeader, Section } from "@/components/ui/primitives";
import { getToolkitArticles } from "@/lib/data/content";

export const metadata: Metadata = {
  title: brand.toolkit?.label ?? "Toolkit",
  description: brand.toolkit?.intro,
};

export default async function ToolkitPage() {
  if (!brand.features.toolkit) notFound();
  const articles = await getToolkitArticles();
  return (
    <>
      <PageHeader
        eyebrow={brand.toolkit?.label ?? "Toolkit"}
        title={brand.toolkit?.headline ?? "Toolkit"}
        intro={brand.toolkit?.intro}
      />
      <Section>
        <div className="max-w-2xl">
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">Your path, step by step</h2>
          <p className="mt-3 text-lg text-muted">
            Starting a business? Work through the three areas in order. Already running one? Jump to the
            area you need.
          </p>
        </div>
        <ol className="mt-12 grid gap-6 lg:grid-cols-3">
          {TOOLKIT_CATEGORIES.map((category, i) => {
            const list = articles.filter((a) => a.category === category.slug);
            return (
              <li key={category.slug} className="flex min-w-0 flex-col rounded-brand border border-line bg-surface p-6">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="font-heading flex h-11 w-11 items-center justify-center rounded-full text-xl text-white"
                    style={{ background: categoryColor[category.slug] }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Step {i + 1}</span>
                </div>
                <h3 className="mt-5 text-2xl font-medium tracking-tight">
                  <Link href={`/toolkit/${category.slug}`} className="hover:text-primary">
                    {category.label}
                  </Link>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{category.description}</p>
                <div className="mt-6 flex-1">
                  <ArticleSteps category={category} articles={list} />
                </div>
                <Link
                  href={`/toolkit/${category.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  All {category.label.toLowerCase()} guides
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ol>
      </Section>
      <CallToAction
        title="Need help _applying_ this to your business?"
        text="Book a consultation and talk it through with us, online or in person."
      />
    </>
  );
}

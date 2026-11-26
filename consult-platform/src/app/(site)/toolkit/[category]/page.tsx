import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand, TOOLKIT_CATEGORIES, toolkitCategory } from "@/config/brand";
import { CallToAction } from "@/components/site/cards";
import { ArticleSteps } from "@/components/toolkit/parts";
import { PageHeader, Section } from "@/components/ui/primitives";
import { getToolkitArticles } from "@/lib/data/content";

export function generateStaticParams() {
  return TOOLKIT_CATEGORIES.map(({ slug }) => ({ category: slug }));
}

export async function generateMetadata({ params }: PageProps<"/toolkit/[category]">): Promise<Metadata> {
  const category = toolkitCategory((await params).category);
  if (!category) return {};
  return { title: `${category.label} | ${brand.toolkit?.label ?? "Toolkit"}`, description: category.description };
}

export default async function ToolkitCategoryPage({ params }: PageProps<"/toolkit/[category]">) {
  if (!brand.features.toolkit) notFound();
  const category = toolkitCategory((await params).category);
  if (!category) notFound();
  const articles = (await getToolkitArticles()).filter((a) => a.category === category.slug);
  const index = TOOLKIT_CATEGORIES.findIndex((c) => c.slug === category.slug);
  const prev = TOOLKIT_CATEGORIES[index - 1];
  const next = TOOLKIT_CATEGORIES[index + 1];

  return (
    <>
      <PageHeader
        eyebrow={`${brand.toolkit?.label ?? "Toolkit"} · Step ${index + 1} of ${TOOLKIT_CATEGORIES.length}`}
        title={category.label}
        intro={category.description}
      />
      <Section>
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-medium tracking-tight">Read in this order</h2>
          <ArticleSteps category={category} articles={articles} />
          <nav aria-label="Toolkit areas" className="mt-12 flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-sm font-semibold">
            {prev ? (
              <Link href={`/toolkit/${prev.slug}`} className="inline-flex items-center gap-2 text-primary">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {prev.label}
              </Link>
            ) : (
              <Link href="/toolkit" className="inline-flex items-center gap-2 text-primary">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                All areas
              </Link>
            )}
            {next && (
              <Link href={`/toolkit/${next.slug}`} className="inline-flex items-center gap-2 text-primary">
                Next: {next.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
          </nav>
        </div>
      </Section>
      <CallToAction
        title={`Want help with your _${category.label.toLowerCase()}_?`}
        text="Book a consultation and we will look at your business with you."
      />
    </>
  );
}

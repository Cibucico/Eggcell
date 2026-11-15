import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { PreviewBanner } from "@/components/site/preview-banner";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PreviewBanner />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

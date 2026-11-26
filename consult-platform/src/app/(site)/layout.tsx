import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { PreviewBanner } from "@/components/site/preview-banner";
import { ChatWidget } from "@/components/chat/chat-widget";
import { brand } from "@/config/brand";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PreviewBanner />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      {brand.features.liveChat && <ChatWidget />}
    </>
  );
}

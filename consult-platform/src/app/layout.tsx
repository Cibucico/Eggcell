import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import { brand, siteUrl, themeVars } from "@/config/brand";
import "./globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const serif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} | ${brand.tagline}`,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  ...(brand.icons
    ? {
        icons: {
          icon: [{ url: brand.icons.s48, sizes: "48x48", type: "image/png" }, { url: brand.icons.s192, sizes: "192x192", type: "image/png" }],
          apple: [{ url: brand.icons.s180, sizes: "180x180" }],
        },
      }
    : {}),
  appleWebApp: { capable: true, title: brand.name.split(" ")[0], statusBarStyle: "default" },
  openGraph: {
    type: "website",
    siteName: brand.name,
    locale: "en_ZA",
    title: brand.name,
    description: brand.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: brand.theme.deep,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-ZA"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
      style={themeVars()}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-brand focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-fg"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

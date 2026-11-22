import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { brand, mainNav } from "@/config/brand";
import { Logo } from "./logo";

const socialLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
};

export function SiteFooter() {
  const socials = Object.entries(brand.social).filter(([, url]) => Boolean(url));
  return (
    <footer className="no-print grain relative overflow-hidden bg-deep text-deep-fg">
      <div aria-hidden className="glow -left-40 top-0 h-96 w-96 bg-primary opacity-40" />
      <div className="container-page relative grid gap-10 pt-20 pb-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo inverse />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-deep-fg/70">{brand.description}</p>
          {socials.length > 0 && (
            <ul className="mt-5 flex gap-4 text-sm">
              {socials.map(([key, url]) => (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-deep-fg/70 underline-offset-4 hover:text-accent hover:underline"
                  >
                    {socialLabels[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2.5 text-sm">
            {mainNav().map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-deep-fg/80 hover:text-accent">
                  {item.label}
                </Link>
              </li>
            ))}
            {brand.features.booking && (
              <li>
                <Link href="/book" className="text-deep-fg/80 hover:text-accent">
                  Book a consultation
                </Link>
              </li>
            )}
            {brand.features.training && (
              <li>
                <Link href="/certificates" className="text-deep-fg/80 hover:text-accent">
                  Verify a certificate
                </Link>
              </li>
            )}
          </ul>
        </nav>
        <div>
          <p className="eyebrow mb-4">Contact</p>
          <ul className="space-y-3 text-sm text-deep-fg/80">
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <a href={`mailto:${brand.contact.email}`} className="break-all hover:text-accent">
                {brand.contact.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <a href={`tel:${brand.contact.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                {brand.contact.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span>
                {brand.contact.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div aria-hidden className="container-page relative select-none overflow-hidden">
        <p className="font-heading whitespace-nowrap text-[18vw] font-medium italic leading-[0.8] tracking-tighter text-deep-fg/[0.06] lg:text-[13rem]">
          {brand.name.split(" ")[0]}
        </p>
      </div>
      <div className="relative border-t border-deep-fg/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-deep-fg/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {brand.legalName}
            {brand.legal.registrationNumber ? ` · Reg. ${brand.legal.registrationNumber}` : ""}
          </p>
          <ul className="flex gap-5">
            <li>
              <Link href="/legal/privacy" className="hover:text-accent">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="hover:text-accent">
                Terms of use
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

// Cached so the year is fixed per build/revalidation rather than read on every request.
async function CurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

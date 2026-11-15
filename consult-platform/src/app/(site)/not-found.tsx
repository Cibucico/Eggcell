import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      <p className="eyebrow">Page not found</p>
      <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">We could not find that page</h1>
      <p className="mt-4 max-w-md text-muted">
        The page may have moved, or the link may be out of date.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/contact" variant="outline">
          Contact us
        </ButtonLink>
      </div>
    </div>
  );
}

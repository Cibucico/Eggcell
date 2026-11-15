import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="container-page flex flex-1 flex-col items-center justify-center py-28 text-center">
      <p className="eyebrow">Page not found</p>
      <h1 className="mt-4 text-4xl font-semibold">We could not find that page</h1>
      <div className="mt-8">
        <ButtonLink href="/">Back to home</ButtonLink>
      </div>
    </main>
  );
}

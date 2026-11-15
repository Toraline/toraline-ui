import { ThemeToggle } from "@toraline.tech/ui/theme";

/**
 * The test page. Every color, font, radius and shadow class here is a token class:
 * it comes from a level 2 token of the library or from a color this app added.
 * The other classes (spacing, size, layout) are standard Tailwind classes.
 */
export default function Page() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="font-heading text-3xl font-bold text-brand">toraline-ui playground</h1>
      <p className="mt-4">
        This page tests the themes. Press the button to change the theme. Reload the page: it
        opens in the theme you chose.
      </p>
      <ThemeToggle className="mt-4" />
      <p className="mt-4">
        <a className="text-brand underline" href="/components">
          The components of the library
        </a>
      </p>

      <section className="mt-6 rounded border border-default bg-surface p-4 shadow">
        <h2 className="font-heading text-xl font-bold">A card</h2>
        <p className="mt-2">Its colors, border, radius and shadow come from level 2 tokens.</p>
        <p className="mt-2">
          The headings use the font Fraunces. This app loads it with{" "}
          <code className="font-mono">next/font</code> and sets it as{" "}
          <code className="font-mono">--font-heading</code> through the theme function.
        </p>
        <p className="mt-2 text-tertiary">
          This text uses the class <code className="font-mono">text-tertiary</code>.
        </p>
      </section>

      <ul className="mt-6 flex flex-wrap gap-3">
        <li className="rounded bg-primary px-3 py-1 text-inverse">bg-primary</li>
        <li className="rounded bg-error px-3 py-1 text-error">bg-error</li>
        <li className="rounded bg-success px-3 py-1 text-success">bg-success</li>
        <li className="rounded bg-surface px-3 py-1">bg-surface</li>
        <li data-testid="promo" className="rounded bg-promo px-3 py-1 text-on-promo">
          bg-promo, a color this app added
        </li>
      </ul>
    </main>
  );
}

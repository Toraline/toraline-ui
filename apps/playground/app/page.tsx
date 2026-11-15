import { ThemeToggle } from "@toraline/ui/theme";

/**
 * The test page. Every color, font, radius and shadow class here is a token class:
 * it comes from a level 2 token of the library or from a color this app added.
 * The other classes (spacing, size, layout) are standard Tailwind classes.
 */
export default function Page() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="font-heading text-3xl font-bold text-primary">toraline-ui playground</h1>
      <p className="mt-4">
        This page tests the themes. Press the button to change the theme. Reload the page: it
        opens in the theme you chose.
      </p>
      <ThemeToggle className="mt-4" />

      <section className="mt-6 rounded border border-border bg-surface-raised p-4 shadow">
        <h2 className="font-heading text-xl font-bold">A card</h2>
        <p className="mt-2">Its colors, border, radius and shadow come from level 2 tokens.</p>
        <p className="mt-2">
          The headings use the font Fraunces. This app loads it with{" "}
          <code className="font-mono">next/font</code> and sets it as{" "}
          <code className="font-mono">--font-heading</code> through the theme function.
        </p>
        <p className="mt-2 text-text-muted">
          This text uses the class <code className="font-mono">text-text-muted</code>.
        </p>
      </section>

      <ul className="mt-6 flex flex-wrap gap-3">
        <li className="rounded bg-primary px-3 py-1 text-primary-foreground">bg-primary</li>
        <li className="rounded bg-danger px-3 py-1 text-danger-foreground">bg-danger</li>
        <li className="rounded bg-success px-3 py-1 text-success-foreground">bg-success</li>
        <li className="rounded bg-surface-muted px-3 py-1">bg-surface-muted</li>
        <li data-testid="brand" className="rounded bg-brand px-3 py-1 text-brand-foreground">
          bg-brand, a color this app added
        </li>
      </ul>
    </main>
  );
}

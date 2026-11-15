import { ThemeToggle } from "@toraline/ui/theme";

export default function Page() {
  return (
    <main>
      <h1>toraline-ui playground</h1>
      <p>
        This page tests the themes. Press the button to change the theme. Reload the page: it
        opens in the theme you chose.
      </p>
      <ThemeToggle />
      <section className="card">
        <h2>A card</h2>
        <p>Its colors, border, radius and shadow come from level 2 tokens.</p>
        <p className="muted">
          This text uses <code>--color-text-muted</code>.
        </p>
      </section>
    </main>
  );
}

import type { ReactNode } from "react";
import { Button, buttonSizes, buttonVariants } from "@toraline/ui";
import { ThemeToggle } from "@toraline/ui/theme";

/**
 * The page of the components. It shows every component of @toraline/ui with
 * every variant and state. Press the theme button to see them in the other theme.
 */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 rounded border border-border p-4">
      <h2 className="font-heading text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm text-text-muted">{label}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default function ComponentsPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-heading text-3xl font-bold text-primary">Components</h1>
      <p className="mt-4">
        Every component of the library, with every variant and state. Press the button to see
        them in the other theme.
      </p>
      <ThemeToggle className="mt-4" />

      <Section title="Button">
        <Row label="Variants">
          {buttonVariants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </Row>
        <Row label="Sizes">
          {buttonSizes.map((size) => (
            <Button key={size} size={size}>
              Size {size}
            </Button>
          ))}
        </Row>
        <Row label="Disabled">
          {buttonVariants.map((variant) => (
            <Button key={variant} variant={variant} disabled>
              {variant}
            </Button>
          ))}
        </Row>
        <Row label="Loading">
          {buttonVariants.map((variant) => (
            <Button key={variant} variant={variant} loading>
              {variant}
            </Button>
          ))}
        </Row>
        <Row label="With a class of the app (rounded-full)">
          <Button className="rounded-full" data-testid="button-app-class">
            Round
          </Button>
        </Row>
      </Section>
    </main>
  );
}

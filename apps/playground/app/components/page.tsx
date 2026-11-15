import { Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  BreadCrumbs,
  Button,
  Input,
  Tabs,
  Toggle,
  buttonSizes,
  buttonVariants,
} from "@toraline.tech/ui";
import { ThemeToggle } from "@toraline.tech/ui/theme";
import { SplitButtonExamples } from "./SplitButtonExamples";

/**
 * The page of the components. It shows every component of @toraline.tech/ui with
 * every variant and state. Press the theme button to see them in the other theme.
 */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 rounded-xl border border-default bg-surface p-4">
      <h2 className="font-heading text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm text-secondary">{label}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const orderTabs = [
  { id: "all", label: "All", content: <p>The content of the tab "All".</p> },
  { id: "orders", label: "Orders", content: <p>The content of the tab "Orders".</p> },
  { id: "premium", label: "Premium", content: <p>The content of the tab "Premium".</p> },
  { id: "support", label: "Support", content: <p>The content of the tab "Support".</p> },
];

const crumbs = [
  { label: "Playground", href: "/" },
  { label: "Components", href: "/components" },
  { label: "BreadCrumbs", href: "/components" },
];

export default function ComponentsPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-heading text-3xl font-bold text-brand">Components</h1>
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
        <Row label="Sizes: 32, 40 and 48 pixels high">
          {buttonSizes.map((size) => (
            <Button key={size} size={size}>
              Size {size}
            </Button>
          ))}
        </Row>
        <Row label="With an icon of lucide-react (icon={Plus}), given by this Server Component">
          {buttonSizes.map((size) => (
            <Button key={size} size={size} icon={Plus} variant="secondary">
              New order
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

      <Section title="Input">
        <div className="mt-4 grid max-w-md gap-4">
          <Input label="Empty" name="empty" />
          <Input label="With a placeholder" name="placeholder" placeholder="Order number" />
          <Input label="With a value" name="value" defaultValue="Order 12" />
          <Input
            label="With an error"
            name="error"
            defaultValue="Order"
            error="The order number is required."
          />
          <Input label="Disabled" name="disabled" defaultValue="Order 12" disabled />
          <Input
            label="With a class of the app (max-w-40)"
            name="app-class"
            className="max-w-40"
          />
        </div>
      </Section>

      <Section title="Toggle">
        <Row label="Off and on. Press one to change it">
          <Toggle label="Starts off" name="off" />
          <Toggle label="Starts on" name="on" defaultChecked />
        </Row>
        <Row label="Disabled">
          <Toggle label="Disabled, off" name="disabled-off" disabled />
          <Toggle label="Disabled, on" name="disabled-on" disabled defaultChecked />
        </Row>
        <Row label="With no visible label (aria-label)">
          <Toggle aria-label="Send e-mails" name="no-label" />
        </Row>
        <Row label="With a class of the app (text-lg)">
          <Toggle label="Larger" name="app-class" className="text-lg" />
        </Row>
      </Section>

      <Section title="Tabs">
        <Row label="The first tab is selected. Use the Left and Right arrow keys">
          <Tabs tabs={orderTabs} aria-label="Orders by kind" className="w-full" />
        </Row>
        <Row label='Starts on the tab "Premium" (defaultSelectedId), with a class of the app (mt-6)'>
          <Tabs
            tabs={orderTabs}
            defaultSelectedId="premium"
            aria-label="Orders by kind, second example"
            className="mt-6 w-full"
          />
        </Row>
      </Section>

      <Section title="BreadCrumbs">
        <Row label="3 steps. The last one is the current page">
          <BreadCrumbs crumbs={crumbs} />
        </Row>
        <Row label="1 step">
          <BreadCrumbs crumbs={crumbs.slice(0, 1)} aria-label="Breadcrumb with 1 step" />
        </Row>
        <Row label="With the Link of next/link (linkComponent) and a class of the app (font-normal)">
          <BreadCrumbs
            crumbs={crumbs}
            linkComponent={Link}
            className="font-normal"
            aria-label="Breadcrumb with next/link"
          />
        </Row>
      </Section>

      <Section title="SplitButton">
        <SplitButtonExamples />
      </Section>
    </main>
  );
}

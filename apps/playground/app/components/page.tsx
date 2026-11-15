import { ArrowRight, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  BreadCrumbs,
  Button,
  ButtonLink,
  Field,
  IconButton,
  Tabs,
  TextInput,
  Toggle,
  buttonSizes,
  buttonVariants,
  iconButtonSizes,
  iconButtonVariants,
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

/** The classes of a plain control, to show that Field works with any control. */
const plainControlClass =
  "min-h-10 w-full rounded-md border border-default bg-surface px-3 py-2 text-sm/5 text-primary";

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

      <Section title="ButtonLink">
        <Row label="A plain <a>, in every variant">
          {buttonVariants.map((variant) => (
            <ButtonLink key={variant} variant={variant} href="/">
              {variant}
            </ButtonLink>
          ))}
        </Row>
        <Row label="With the Link of next/link (linkComponent), in every size, with an icon">
          {buttonSizes.map((size) => (
            <ButtonLink
              key={size}
              linkComponent={Link}
              href="/"
              prefetch={false}
              size={size}
              variant="secondary"
              icon={ArrowRight}
              data-testid={`button-link-next-${size}`}
            >
              To the first page
            </ButtonLink>
          ))}
        </Row>
      </Section>

      <Section title="IconButton">
        <Row label="Variants">
          {iconButtonVariants.map((variant) => (
            <IconButton key={variant} variant={variant} icon={Trash2} aria-label={`Delete, ${variant}`} />
          ))}
        </Row>
        <Row label="Sizes: a square of 32, 40 and 48 pixels">
          {iconButtonSizes.map((size) => (
            <IconButton
              key={size}
              size={size}
              variant="secondary"
              icon={Trash2}
              aria-label={`Delete, size ${size}`}
            />
          ))}
        </Row>
        <Row label="Disabled">
          {iconButtonVariants.map((variant) => (
            <IconButton
              key={variant}
              variant={variant}
              icon={Trash2}
              aria-label={`Delete, ${variant}, disabled`}
              disabled
            />
          ))}
        </Row>
      </Section>

      <Section title="Field and TextInput">
        <div className="mt-4 grid max-w-md gap-4">
          <Field label="Empty">
            <TextInput name="empty" />
          </Field>
          <Field label="With a placeholder and a hint" hint="As it is written on the invoice.">
            <TextInput name="placeholder" placeholder="Order number" />
          </Field>
          <Field label="With an error" hint="This hint is not shown." error="The order number is required.">
            <TextInput name="error" defaultValue="Order" />
          </Field>
          <Field label="Optional" optional>
            <TextInput name="optional" />
          </Field>
          <Field label="Opcional, em português" optional optionalText="(opcional)">
            <TextInput name="optional-text" />
          </Field>
          <Field label="Disabled">
            <TextInput name="disabled" defaultValue="Order 12" disabled />
          </Field>
          <Field label="With an icon of lucide-react (icon={Search})">
            <TextInput name="search" type="search" icon={Search} placeholder="Search an order" />
          </Field>
          <Field label='Size "sm": 32 pixels high'>
            <TextInput name="small" size="sm" />
          </Field>
          <Field label="With a class of the app (max-w-40)">
            <TextInput name="app-class" className="max-w-40" />
          </Field>
          <Field label="With a native select" hint="Field works with any control.">
            <select className={plainControlClass} name="field-select">
              <option>Monthly</option>
              <option>By the hour</option>
            </select>
          </Field>
        </div>
        <Row label="With no Field (aria-label)">
          <TextInput aria-label="Order number" name="no-field" className="max-w-60" />
        </Row>
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

      <Section title="TabNav">
        <Row label="Tabs that are links to routes. They are on their own pages, because they need routes">
          <ButtonLink linkComponent={Link} href="/tab-nav" variant="secondary" icon={ArrowRight}>
            Open the pages of TabNav
          </ButtonLink>
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

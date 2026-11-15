import Link from "next/link";
import type { ReactNode } from "react";
import {
  Checkbox,
  CheckboxControl,
  DecimalInput,
  Field,
  Select,
  Textarea,
  controlSizes,
  parseDecimalInput,
} from "@toraline.tech/ui";
import { ThemeToggle } from "@toraline.tech/ui/theme";

/**
 * The route /forms-feedback: the form controls and the feedback components of
 * phase 8 (TOR-1124), each with every variant, size and state. Press the theme
 * button to see them in the other theme. The page is a Server Component.
 */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 rounded-xl border border-default bg-surface p-4">
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
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

const contractKinds = (
  <>
    <option value="monthly">Monthly</option>
    <option value="hourly">By the hour</option>
    <option value="fixed">Fixed price</option>
  </>
);

export default function FormsFeedbackPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-heading text-3xl font-semibold text-brand">Forms and feedback</h1>
      <p className="mt-4">
        The form controls and the feedback components of the library, with the look of the app
        Intraweb.
      </p>
      <p className="mt-2">
        <Link className="text-brand underline" href="/components">
          Back to the components
        </Link>
      </p>
      <ThemeToggle className="mt-4" />

      <Section title="Select">
        <Row label="Sizes">
          {controlSizes.map((size) => (
            <Select key={size} size={size} aria-label={`Kind of contract, ${size}`}>
              {contractKinds}
            </Select>
          ))}
        </Row>
        <Row label="States">
          <Select aria-label="Not valid" aria-invalid="true">
            {contractKinds}
          </Select>
          <Select aria-label="Disabled" disabled>
            {contractKinds}
          </Select>
          <Select aria-label="As wide as its content" className="w-auto">
            {contractKinds}
          </Select>
        </Row>
        <div className="mt-4 grid max-w-sm gap-4">
          <Field label="Kind of contract" hint="It decides how the hours are counted.">
            <Select name="kind">{contractKinds}</Select>
          </Field>
          <Field label="State" error="Choose a state.">
            <Select name="state">{contractKinds}</Select>
          </Field>
        </div>
      </Section>

      <Section title="Textarea">
        <Row label="Rows">
          <Textarea aria-label="Notes, 2 rows" rows={2} placeholder="2 rows" />
          <Textarea aria-label="Notes, 4 rows" rows={4} defaultValue="4 rows" />
        </Row>
        <Row label="States">
          <Textarea aria-label="Not valid" aria-invalid="true" defaultValue="Not valid" />
          <Textarea aria-label="Disabled" disabled defaultValue="Disabled" />
          <Textarea aria-label="Read-only" readOnly defaultValue="Read-only" />
        </Row>
        <div className="mt-4 grid max-w-sm gap-4">
          <Field label="Notes" optional hint="200 characters at most.">
            <Textarea name="notes" rows={3} />
          </Field>
          <Field label="Reason" error="The reason is required.">
            <Textarea name="reason" rows={3} />
          </Field>
        </div>
      </Section>

      <Section title="DecimalInput">
        <Row label="Sizes">
          {controlSizes.map((size) => (
            <DecimalInput key={size} size={size} aria-label={`Price, ${size}`} placeholder="0,00" />
          ))}
        </Row>
        <Row label="A comma and a point as the decimal mark, and the number the app reads">
          {["1.234,50", "1234.50", "12x"].map((text) => (
            <div key={text} className="grid gap-1">
              <DecimalInput aria-label={`Price ${text}`} defaultValue={text} className="w-40" />
              <span className="text-sm text-secondary" data-testid={`number-${text}`}>
                {String(parseDecimalInput(text))}
              </span>
            </div>
          ))}
        </Row>
        <Row label="States">
          <DecimalInput aria-label="Not valid" aria-invalid="true" defaultValue="12x" />
          <DecimalInput aria-label="Disabled" disabled defaultValue="12,50" />
        </Row>
        <div className="mt-4 grid max-w-sm gap-4">
          <Field label="Price" hint="With a comma or a point.">
            <DecimalInput name="price" />
          </Field>
          <Field label="Quantity" error="Type a number, for example 12,50.">
            <DecimalInput name="quantity" defaultValue="12x" />
          </Field>
        </div>
      </Section>

      <Section title="Checkbox and CheckboxControl">
        <Row label="Checkbox: not checked, checked, disabled">
          <Checkbox label="Send the invoice by e-mail" name="send" />
          <Checkbox label="Checked" name="checked" defaultChecked />
          <Checkbox label="Disabled" name="disabled" disabled />
          <Checkbox label="Disabled, checked" name="disabled-checked" disabled defaultChecked />
        </Row>
        <Row label="CheckboxControl: only the box">
          <CheckboxControl aria-label="Not checked" />
          <CheckboxControl aria-label="Checked" defaultChecked />
          <CheckboxControl aria-label="Disabled" disabled />
          <CheckboxControl aria-label="Disabled, checked" disabled defaultChecked />
          <CheckboxControl aria-label="Changed" changed />
          <CheckboxControl aria-label="Changed, checked" changed defaultChecked />
        </Row>
        <Row label="CheckboxControl with a label of the app">
          <CheckboxControl id="task-flowers" name="task-flowers" />
          <label htmlFor="task-flowers" className="text-sm text-body">
            Buy the flowers
          </label>
        </Row>
      </Section>
    </main>
  );
}

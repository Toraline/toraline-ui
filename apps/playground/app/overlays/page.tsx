import type { ReactNode } from "react";
import { CloseButton } from "@toraline.tech/ui";
import { ThemeToggle } from "@toraline.tech/ui/theme";
import { ConfirmationExamples } from "./ConfirmationExamples";
import { DrawerExamples } from "./DrawerExamples";
import { ModalExamples } from "./ModalExamples";

/**
 * The page of the overlays (phase 9). An overlay is a part of the screen that
 * opens above the page: a dialog, a side panel, a menu, a popover, a tooltip.
 *
 * This page is a Server Component. An overlay that the app closes with a
 * function ("onClose", "onSelect") is in a Client Component file next to this
 * one, because a Server Component cannot give a function to a component that
 * runs in the browser.
 */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 rounded-xl border border-default bg-surface p-4">
      <h2 className="font-heading text-xl font-medium">{title}</h2>
      {children}
    </section>
  );
}

export default function OverlaysPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-heading text-3xl font-medium text-brand">Overlays</h1>
      <p className="mt-4">
        <a className="text-brand underline" href="/">
          Back to the first page
        </a>
      </p>
      <ThemeToggle className="mt-4" />

      <Section title="CloseButton">
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <CloseButton />
          <CloseButton aria-label="Close, small" size="sm" />
          <CloseButton aria-label="Close, with a border" variant="secondary" />
          <CloseButton aria-label="Close, disabled" disabled />
        </div>
      </Section>

      <Section title="Modal">
        <ModalExamples />
      </Section>

      <Section title="Drawer">
        <p className="mt-2 text-sm/5 text-secondary">
          The page stays usable while the panel is open: press the button of the page.
        </p>
        <DrawerExamples />
      </Section>

      <Section title="DiscardConfirmation and DeleteOverlay">
        <ConfirmationExamples />
      </Section>
    </main>
  );
}

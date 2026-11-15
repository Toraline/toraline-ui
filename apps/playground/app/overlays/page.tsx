import type { ReactNode } from "react";
import { Settings } from "lucide-react";
import { CloseButton, IconButton, Popover, Toggle, Tooltip, tooltipSides } from "@toraline.tech/ui";
import { ThemeToggle } from "@toraline.tech/ui/theme";
import { ActionMenuExamples } from "./ActionMenuExamples";
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

      <Section title="ActionMenu">
        <ActionMenuExamples />
      </Section>

      <Section title="Popover">
        <p className="mt-2 text-sm/5 text-secondary">
          This page, a Server Component, renders these Popovers itself: the label and the content
          are elements, not functions.
        </p>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <Popover label="Columns">
            <div className="flex flex-col gap-3">
              <Toggle label="Price" defaultChecked />
              <Toggle label="Stock" />
            </div>
          </Popover>
          <Popover label="Disabled" disabled>
            Never shown
          </Popover>
          <Popover label="Columns, lined up to the right" align="right" panelClassName="w-64">
            <p className="text-sm/5 text-body">The right edges of the button and the panel line up.</p>
          </Popover>
        </div>
      </Section>

      <Section title="Tooltip">
        <p className="mt-2 text-sm/5 text-secondary">
          This page, a Server Component, renders these Tooltips itself, with an IconButton that gets
          its icon from the server. Move the pointer over a button, or press Tab.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-10">
          {tooltipSides.map((side) => (
            <Tooltip key={side} label={`Settings of the shop (${side})`} side={side}>
              <IconButton icon={Settings} aria-label={`Settings, ${side}`} variant="secondary" />
            </Tooltip>
          ))}
          <Tooltip label="Settings">
            <IconButton icon={Settings} aria-label="Settings" />
          </Tooltip>
        </div>
        <div className="mt-4 flex justify-end">
          <Tooltip label="Near the right edge: shown on the left">
            <IconButton icon={Settings} aria-label="Settings at the edge" variant="secondary" />
          </Tooltip>
        </div>
      </Section>
    </main>
  );
}

import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";

/*
 * The classes of the card. They are the ones of the Panel of the app Intraweb
 * (components/ui/panel.tsx): the background of a card with its shadow, a space
 * of 16 pixels between its parts, and a larger corner and padding from the
 * breakpoint "md" of Tailwind CSS (a screen 768 pixels wide or more).
 * "scroll-mt-6" leaves 24 pixels above the card when a link goes to its id.
 */
const rootClass = "scroll-mt-6 space-y-4 rounded-lg bg-surface p-4 shadow-card md:rounded-xl md:p-6";

/** The header: the title on the left and the actions on the right. On a narrow card the actions go to the next line. */
const headerClass = "flex flex-wrap items-start justify-between gap-3";

const titlesClass = "space-y-0.5";

/** The title: 18 pixels in the medium weight of the heading font, the values of Intraweb's text style "heading-section". */
const titleClass = "font-heading text-lg/7 font-medium text-primary";

const subtitleClass = "text-sm text-tertiary";

const actionsClass = "flex flex-wrap items-center gap-2";

/** true when a prop holds something to show. */
const hasContent = (value: ReactNode) =>
  value !== undefined && value !== null && value !== false && value !== "";

export type PanelProps = Omit<ComponentProps<"section">, "title"> & {
  /** The title of the card, shown as a heading of level 2 at its top. */
  title?: ReactNode;
  /** A quiet line under the title. It is shown only when the card has a title. */
  subtitle?: ReactNode;
  /** Buttons or links at the top right of the card, for example <Button size="sm">Edit</Button>. */
  actions?: ReactNode;
  /** The content of the card. */
  children?: ReactNode;
};

/**
 * A card that groups content: the white box with a shadow that holds one part
 * of a page, with an optional title, subtitle and actions at its top.
 *
 * - It is a <section>. The title is an <h2>.
 * - With no title and no actions it has no header: only the content.
 * - "id" makes the card the target of a link (href="#id").
 * - "className" is added after the library's classes. Every other prop goes
 *   to the <section>, and "ref" points to it. The HTML attribute "title" (a
 *   tooltip) is replaced by the title of the card.
 */
export function Panel({ title, subtitle, actions, className, children, ...sectionProps }: PanelProps) {
  const hasTitle = hasContent(title);
  const hasActions = hasContent(actions);

  return (
    <section {...sectionProps} className={classNames(rootClass, className)}>
      {hasTitle || hasActions ? (
        <div className={headerClass} data-slot="header">
          {hasTitle ? (
            <div className={titlesClass} data-slot="titles">
              <h2 className={titleClass} data-slot="title">
                {title}
              </h2>
              {hasContent(subtitle) ? (
                <p className={subtitleClass} data-slot="subtitle">
                  {subtitle}
                </p>
              ) : null}
            </div>
          ) : (
            // An empty element keeps the actions on the right when the card has no title.
            <span />
          )}
          {hasActions ? (
            <div className={actionsClass} data-slot="actions">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

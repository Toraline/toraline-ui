import type { ComponentProps, ElementType } from "react";
import type { IconComponent } from "../shared/icon.js";
import { buttonClassNames, buttonIconClass } from "./button-class.js";
import type { ButtonSize, ButtonVariant } from "./button-options.js";

/** The props of ButtonLink that are its own, and not the link's. */
type ButtonLinkOwnProps<LinkComponent extends ElementType> = {
  /**
   * The component that renders the link. It receives "href", "className",
   * "children" and every other prop. When missing: "a". A Next.js app gives the
   * Link of "next/link", so a press does not load the whole page again.
   */
  linkComponent?: LinkComponent;
  /** The look: one of the variants of Button. When missing: "primary". */
  variant?: ButtonVariant;
  /** The size: one of the sizes of Button. When missing: "md". */
  size?: ButtonSize;
  /**
   * An icon shown before the text: a component that draws an <svg>, for example
   * an icon of "lucide-react" (icon={Plus}). It is decoration: a screen reader skips it.
   */
  icon?: IconComponent;
};

/**
 * The props of ButtonLink: the props of the link component, plus its own.
 * With no "linkComponent" they are the props of <a>. With
 * linkComponent={Link} they are the props of that Link, for example "prefetch".
 */
export type ButtonLinkProps<LinkComponent extends ElementType = "a"> = Omit<
  ComponentProps<LinkComponent>,
  keyof ButtonLinkOwnProps<LinkComponent>
> &
  ButtonLinkOwnProps<LinkComponent>;

/**
 * A link that looks like a Button. Use it when a press goes to another page;
 * use Button when a press does something on this page.
 *
 * - It is a real link: an <a>, or the link component the app gives. A screen
 *   reader says "link", and the Enter key follows it.
 * - It has the variants, the sizes and the icon of Button, with the same classes.
 * - Every other prop goes to the link, and "ref" points to it.
 * - A link cannot be disabled or loading. A page that must not offer the link does not render it.
 */
export function ButtonLink<LinkComponent extends ElementType = "a">(
  props: ButtonLinkProps<LinkComponent>,
) {
  const {
    linkComponent,
    variant = "primary",
    size = "md",
    icon: Icon,
    className,
    children,
    ...linkProps
  } = props as ButtonLinkProps<"a">;
  const Link: ElementType = linkComponent ?? "a";

  return (
    <Link
      {...linkProps}
      className={buttonClassNames({ variant, size, className })}
      data-variant={variant}
      data-size={size}
    >
      {Icon === undefined ? null : <Icon aria-hidden="true" className={buttonIconClass[size]} />}
      {children}
    </Link>
  );
}

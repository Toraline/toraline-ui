"use client";

import type { ComponentProps, MouseEvent } from "react";

export type ButtonElementProps = ComponentProps<"button"> & {
  /** true while the action of the button is running: a press does nothing. */
  loading?: boolean;
};

/**
 * The <button> of Button, with the one part that must run in the browser: a
 * loading button stops a press.
 *
 * It is in its own file, with "use client", so that Button itself has none.
 * A Server Component can then give Button an icon component
 * (<Button icon={Plus}>): Next.js does not let a Server Component give a
 * function to a Client Component, and an icon component is a function.
 *
 * This component is not exported from the package.
 */
export function ButtonElement({ loading = false, onClick, ...buttonProps }: ButtonElementProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      // Stops a press, and stops a submit button from sending its form.
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      {...buttonProps}
      aria-busy={loading ? true : undefined}
      aria-disabled={loading ? true : buttonProps["aria-disabled"]}
      onClick={handleClick}
    />
  );
}

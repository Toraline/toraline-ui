/**
 * The lists of the button's variants and sizes.
 * They are in a file with no "use client", so a Server Component can read them.
 */

/** The looks of the button. The first one is the default. */
export const buttonVariants = ["primary", "secondary", "danger"] as const;
export type ButtonVariant = (typeof buttonVariants)[number];

/** The sizes of the button. */
export const buttonSizes = ["sm", "md", "lg"] as const;
export type ButtonSize = (typeof buttonSizes)[number];

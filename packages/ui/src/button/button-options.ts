/**
 * The lists of the button's variants and sizes.
 * Button, ButtonLink and SplitButton read them.
 */

/**
 * The looks of the button. The first one is the default.
 * "primary": the main action. "secondary": another action. "soft": an action
 * with a quiet background in the brand color. "danger": an action that
 * deletes. "ghost": an action with no background and no border.
 */
export const buttonVariants = ["primary", "secondary", "soft", "danger", "ghost"] as const;
export type ButtonVariant = (typeof buttonVariants)[number];

/** The sizes of the button. The button is at least 32 pixels high for "sm", 40 for "md" and 48 for "lg". */
export const buttonSizes = ["sm", "md", "lg"] as const;
export type ButtonSize = (typeof buttonSizes)[number];

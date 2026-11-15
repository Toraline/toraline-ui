/**
 * The list of the buttons that can open the menu of actions.
 * It is in a file with no "use client", so a Server Component can read it.
 */

/**
 * "icon": a small button with 3 dots, for a row of a table.
 * "button": a small button with a text and an arrow.
 */
export const actionMenuTriggers = ["icon", "button"] as const;
export type ActionMenuTrigger = (typeof actionMenuTriggers)[number];

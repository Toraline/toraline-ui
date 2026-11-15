/**
 * The list of the sizes of Modal.
 * It is in a file with no "use client", so a Server Component can read it.
 */

/**
 * The widest the dialog gets: 512 pixels for "md", 672 for "lg", 896 for "xl"
 * and 1152 for "full". The default is "lg", as in the app Intraweb.
 */
export const modalSizes = ["md", "lg", "xl", "full"] as const;
export type ModalSize = (typeof modalSizes)[number];

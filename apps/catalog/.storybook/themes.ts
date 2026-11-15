import { DEFAULT_THEMES } from "@toraline.tech/tokens";

/**
 * The themes the catalog can show, in the order of the toolbar control.
 * It is the list of themes of the library, so a theme that the library adds
 * appears in the toolbar with no change here.
 */
export const catalogThemes: readonly string[] = DEFAULT_THEMES;

/** The theme the catalog shows first. */
export const defaultCatalogTheme = catalogThemes[0] as string;

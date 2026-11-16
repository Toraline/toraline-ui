import { createContext, useContext } from "react";
import { defaultCatalogLanguage } from "../../.storybook/languages";
import type { CatalogLanguage } from "../../.storybook/languages";

/**
 * The language of the documentation pages, chosen with the control "Language"
 * of the toolbar. There are two ways to read it, because a documentation page
 * has two kinds of content:
 *
 * - A story (for example a table of the tokens page) is wrapped by the
 *   decorator of preview.tsx, which gives the language through
 *   StoryLanguageContext. The story reads it with useStoryLanguage().
 * - The text of an MDX page is outside every story. It is wrapped in
 *   <InLanguage> (InLanguage.tsx), which reads the language from Storybook itself.
 */
export const StoryLanguageContext = createContext<CatalogLanguage>(defaultCatalogLanguage);

/** The language of the toolbar, read inside a story. */
export function useStoryLanguage(): CatalogLanguage {
  return useContext(StoryLanguageContext);
}

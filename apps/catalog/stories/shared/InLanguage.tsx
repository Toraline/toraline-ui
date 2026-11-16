import { useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DocsContext, useOf } from "@storybook/addon-docs/blocks";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import { resolveCatalogLanguage } from "../../.storybook/languages";
import type { CatalogLanguage } from "../../.storybook/languages";

/**
 * The language of the toolbar, read in the text of an MDX page.
 * "of" is one story of the page, for example TokenStories.Backgrounds.
 * Storybook keeps the values of the toolbar for each story, so the page asks
 * for them through one of its stories.
 *
 * Only MDX pages import this file. A story reads the language with
 * useStoryLanguage() of language.tsx.
 */
function useDocsLanguage(of: unknown): CatalogLanguage {
  const docsContext = useContext(DocsContext);
  const { story } = useOf(of as Parameters<typeof useOf>[0], ["story"]);
  const [language, setLanguage] = useState(() =>
    resolveCatalogLanguage(docsContext.getStoryContext(story).globals.language),
  );

  useEffect(() => {
    // Storybook sends this event after a person changes a control of the toolbar.
    const onGlobalsUpdated = ({ globals }: { globals: Record<string, unknown> }) => {
      setLanguage(resolveCatalogLanguage(globals.language));
    };
    docsContext.channel.on(GLOBALS_UPDATED, onGlobalsUpdated);
    return () => docsContext.channel.off(GLOBALS_UPDATED, onGlobalsUpdated);
  }, [docsContext.channel]);

  return language;
}

/**
 * Shows its content only when the toolbar has this language. An MDX page
 * writes its text once for each language, each inside one <InLanguage>.
 */
export function InLanguage({
  language,
  of,
  children,
}: {
  /** The language of the content. */
  language: CatalogLanguage;
  /** One story of the page. See useDocsLanguage. */
  of: unknown;
  children: ReactNode;
}) {
  const currentLanguage = useDocsLanguage(of);
  // "lang" tells a screen reader which language the text is in.
  return currentLanguage === language ? <div lang={language}>{children}</div> : null;
}

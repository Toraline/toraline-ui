/**
 * The languages of the documentation pages of the catalog (the guide and the
 * tokens page), in the order of the toolbar control. The component pages are
 * in English only, like the library.
 */
export const catalogLanguages = [
  { value: "en", title: "English" },
  { value: "pt-BR", title: "Português" },
] as const;

/** The code of one language of the catalog. "pt-BR" is Brazilian Portuguese. */
export type CatalogLanguage = (typeof catalogLanguages)[number]["value"];

/** The language the catalog shows first. */
export const defaultCatalogLanguage: CatalogLanguage = "en";

/** The language that a value of the toolbar names. A value that is no language of the catalog gives the default. */
export function resolveCatalogLanguage(value: unknown): CatalogLanguage {
  const found = catalogLanguages.find((language) => language.value === value);
  return found === undefined ? defaultCatalogLanguage : found.value;
}

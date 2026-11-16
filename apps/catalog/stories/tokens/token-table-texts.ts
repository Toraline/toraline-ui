import type { TextStyleName } from "@toraline.tech/tokens";
import type { CatalogLanguage } from "../../.storybook/languages";

/**
 * The texts of the tables of the tokens page, in each language of the catalog.
 * A token name, a class name and a value are the same in every language.
 */
export type TokenTableTexts = {
  /** The caption of the table of each group of level 2 tokens. */
  groupCaptions: {
    backgrounds: string;
    textColors: string;
    borders: string;
    icons: string;
    dataColors: string;
    fonts: string;
    textSizes: string;
    spacing: string;
    radius: string;
    shadows: string;
  };
  /** The caption of the table of each group of level 1 tokens. */
  primitiveCaptions: {
    colors: string;
    fontStacks: string;
    fontSizes: string;
    spacing: string;
    other: string;
  };
  token: string;
  value: string;
  /** The header of the column of one theme. */
  valueInTheme: (themeName: string) => string;
  otherTokens: string;
  noOtherTokens: string;
  textStyles: string;
  /** The headers of the table of the text styles, after the first one. */
  className: string;
  sample: string;
  usedFor: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  other: string;
  /** What each text style is for. */
  textStyleUses: Record<TextStyleName, string>;
};

export const tokenTableTexts: Record<CatalogLanguage, TokenTableTexts> = {
  en: {
    groupCaptions: {
      backgrounds: "Background colors",
      textColors: "Text colors",
      borders: "Border colors",
      icons: "Icon colors",
      dataColors: "Colors of charts and progress bars",
      fonts: "Fonts",
      textSizes: "Text sizes",
      spacing: "Spacing",
      radius: "Radius",
      shadows: "Shadows",
    },
    primitiveCaptions: {
      colors: "Level 1 colors",
      fontStacks: "Level 1 font stacks",
      fontSizes: "Level 1 font sizes",
      spacing: "Level 1 spacing",
      other: "Other level 1 tokens",
    },
    token: "Token",
    value: "Value",
    valueInTheme: (themeName) => `Value in the theme "${themeName}"`,
    otherTokens: "Other tokens",
    noOtherTokens: "Every level 2 token of the library is in one of the groups of this page.",
    textStyles: "Text styles",
    className: "Class",
    sample: "Sample",
    usedFor: "Used for",
    fontSize: "Font size",
    lineHeight: "Line height",
    fontWeight: "Font weight",
    other: "Other",
    textStyleUses: {
      "heading-page": "The title of a page",
      "heading-section": "The title of a section, a dialog or a drawer",
      "heading-card": "The title of a card",
      "display-number": "A large number, for example a total",
      "display-number-sm": "A large number, one size smaller",
      label: "The name of a field, the text of a tab or a badge",
      "label-lg": "A larger label",
      "label-sm": "A smaller label",
      "caption-overline": "A small text in capital letters above a title",
    },
  },
  "pt-BR": {
    groupCaptions: {
      backgrounds: "Cores de fundo",
      textColors: "Cores de texto",
      borders: "Cores de borda",
      icons: "Cores de ícone",
      dataColors: "Cores de gráficos e barras de progresso",
      fonts: "Fontes",
      textSizes: "Tamanhos de texto",
      spacing: "Espaçamento",
      radius: "Raio",
      shadows: "Sombras",
    },
    primitiveCaptions: {
      colors: "Cores de nível 1",
      fontStacks: "Listas de fontes de nível 1",
      fontSizes: "Tamanhos de fonte de nível 1",
      spacing: "Espaçamento de nível 1",
      other: "Outros tokens de nível 1",
    },
    token: "Token",
    value: "Valor",
    valueInTheme: (themeName) => `Valor no tema "${themeName}"`,
    otherTokens: "Outros tokens",
    noOtherTokens: "Todo token de nível 2 da biblioteca está em um dos grupos desta página.",
    textStyles: "Estilos de texto",
    className: "Classe",
    sample: "Amostra",
    usedFor: "Usado para",
    fontSize: "Tamanho da fonte",
    lineHeight: "Altura da linha",
    fontWeight: "Peso da fonte",
    other: "Outros",
    textStyleUses: {
      "heading-page": "O título de uma página",
      "heading-section": "O título de uma seção, de um diálogo ou de um drawer",
      "heading-card": "O título de um card",
      "display-number": "Um número grande, por exemplo um total",
      "display-number-sm": "Um número grande, um tamanho menor",
      label: "O nome de um campo, o texto de uma aba ou de um badge",
      "label-lg": "Um label maior",
      "label-sm": "Um label menor",
      "caption-overline": "Um texto pequeno em letras maiúsculas acima de um título",
    },
  },
};

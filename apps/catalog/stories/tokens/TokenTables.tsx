import type { CSSProperties, ReactNode } from "react";
import {
  colorTokenNames,
  darkTheme,
  lightTheme,
  primitives,
  textStyleNames,
  textStyles,
  themeTokenNames,
} from "@toraline.tech/tokens";
import type { TextStyleName, ThemeTokenName } from "@toraline.tech/tokens";
import "./token-tables.css";

/**
 * The tables of the tokens page. They read the lists and the values of
 * @toraline.tech/tokens, so a token that the library adds or changes appears here
 * with no change in this file.
 *
 * A level 1 token is a raw value, for example --color-brand-700.
 * A level 2 token is a meaning, for example --bg-primary. Each theme gives it a value.
 */

/** The themes of the library, in the order of the columns. */
const libraryThemes = [lightTheme, darkTheme];

/** The text of every font sample and text size sample. */
const sampleText = "Toraline 0123456789";

/** How many spacing units each bar of a spacing sample is wide. */
const spacingSteps = [1, 2, 4, 8];

/** The kinds of sample a table can draw next to a value. */
type SampleKind = "color" | "font" | "text-size" | "space" | "radius" | "shadow" | "none";

/** Draws the sample of one CSS value. "cssValue" is any CSS value, for example "var(--bg-primary)". */
function Sample({ kind, cssValue }: { kind: SampleKind; cssValue: string }) {
  const samples: Record<SampleKind, ReactNode> = {
    color: <span className="catalog-token-sample__color" style={{ backgroundColor: cssValue }} />,
    font: <span style={{ fontFamily: cssValue }}>{sampleText}</span>,
    "text-size": <span style={{ fontSize: cssValue }}>{sampleText}</span>,
    space: spacingSteps.map((step) => (
      <span
        key={step}
        className="catalog-token-sample__space"
        style={{ width: `calc(${cssValue} * ${step})` }}
      />
    )),
    radius: <span className="catalog-token-sample__radius" style={{ borderRadius: cssValue }} />,
    shadow: <span className="catalog-token-sample__shadow" style={{ boxShadow: cssValue }} />,
    none: null,
  };

  // A sample is decoration: the name and the value next to it say the same in text.
  return (
    <span className="catalog-token-sample" aria-hidden="true">
      {samples[kind]}
    </span>
  );
}

/**
 * Splits the value of a level 2 token in two parts: the level 1 token it
 * points to, and the raw value of that token.
 * Example: "var(--color-brand-700)" gives "--color-brand-700" and "#42637c".
 * A value that points to no level 1 token gives only the raw value.
 */
function describeValue(value: string): { reference?: string; raw: string } {
  const primitiveName = /^var\(--([a-z0-9-]+)\)$/.exec(value)?.[1];
  const primitiveValues: Record<string, string> = primitives;
  const raw = primitiveName === undefined ? undefined : primitiveValues[primitiveName];
  return raw === undefined ? { raw: value } : { reference: `--${primitiveName}`, raw };
}

/** A table that scrolls sideways on a narrow screen, and can get the focus so the keyboard can scroll it. */
function ScrollableTable({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="catalog-token-scroll" role="region" aria-label={caption} tabIndex={0}>
      <table className="catalog-token-table">
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  );
}

/** One group of level 2 tokens: which tokens are in it, and which sample it draws. */
type ThemeTokenGroup = {
  caption: string;
  sampleKind: SampleKind;
  includes: (tokenName: string) => boolean;
};

/** true for a level 2 color token. "text-primary" is a color; "text-sm" is a font size. */
const isColorToken = (tokenName: string) => (colorTokenNames as readonly string[]).includes(tokenName);

/** true for a color token of one group. The group is the first part of the name, for example "bg-". */
const isColorOfGroup = (prefix: string) => (tokenName: string) =>
  isColorToken(tokenName) && tokenName.startsWith(prefix);

const themeTokenGroups = {
  backgrounds: {
    caption: "Background colors",
    sampleKind: "color",
    includes: isColorOfGroup("bg-"),
  },
  textColors: {
    caption: "Text colors",
    sampleKind: "color",
    includes: isColorOfGroup("text-"),
  },
  borders: {
    caption: "Border colors",
    sampleKind: "color",
    includes: isColorOfGroup("border-"),
  },
  icons: {
    caption: "Icon colors",
    sampleKind: "color",
    includes: isColorOfGroup("icon-"),
  },
  dataColors: {
    caption: "Colors of charts and progress bars",
    sampleKind: "color",
    includes: isColorOfGroup("data-"),
  },
  fonts: {
    caption: "Fonts",
    sampleKind: "font",
    includes: (tokenName) => tokenName.startsWith("font-"),
  },
  textSizes: {
    caption: "Text sizes",
    sampleKind: "text-size",
    includes: (tokenName) => tokenName.startsWith("text-") && !isColorToken(tokenName),
  },
  spacing: {
    caption: "Spacing",
    sampleKind: "space",
    includes: (tokenName) => tokenName === "spacing",
  },
  radius: {
    caption: "Radius",
    sampleKind: "radius",
    includes: (tokenName) => tokenName.startsWith("radius-"),
  },
  shadows: {
    caption: "Shadows",
    sampleKind: "shadow",
    includes: (tokenName) => tokenName.startsWith("shadow-"),
  },
} satisfies Record<string, ThemeTokenGroup>;

/** The name of a group of level 2 tokens. */
export type ThemeTokenGroupName = keyof typeof themeTokenGroups;

/** The names of the groups of level 2 tokens, in the order of the page. */
export const themeTokenGroupNames = Object.keys(themeTokenGroups) as ThemeTokenGroupName[];

/** A level 2 token that is in none of the groups. The table "Other tokens" shows it. */
const isInNoGroup = (tokenName: string) =>
  Object.values(themeTokenGroups).every((group) => !group.includes(tokenName));

function ThemeTokenRows({
  tokenNames,
  sampleKind,
}: {
  tokenNames: readonly ThemeTokenName[];
  sampleKind: SampleKind;
}) {
  return (
    <>
      <thead>
        <tr>
          <th scope="col">Token</th>
          {libraryThemes.map((theme) => (
            <th key={theme.name} scope="col">
              Value in the theme "{theme.name}"
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tokenNames.map((tokenName) => (
          <tr key={tokenName}>
            <th scope="row">
              <code>--{tokenName}</code>
            </th>
            {libraryThemes.map((theme) => {
              const { reference, raw } = describeValue(theme.tokens[tokenName]);
              return (
                <td
                  key={theme.name}
                  className="catalog-token-table__theme-cell"
                  data-theme={theme.name}
                >
                  <div className="catalog-token-table__value">
                    <Sample kind={sampleKind} cssValue={`var(--${tokenName})`} />
                    {reference === undefined ? null : <code>{reference}</code>}
                    <span className="catalog-token-table__raw">{raw}</span>
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </>
  );
}

/** The table of one group of level 2 tokens, with the value of each token in each theme. */
export function ThemeTokenTable({ group }: { group: ThemeTokenGroupName }) {
  const { caption, sampleKind, includes } = themeTokenGroups[group];
  return (
    <ScrollableTable caption={caption}>
      <ThemeTokenRows tokenNames={themeTokenNames.filter(includes)} sampleKind={sampleKind} />
    </ScrollableTable>
  );
}

/** The table of the level 2 tokens that are in none of the groups. It is empty today. */
export function OtherThemeTokenTable() {
  const tokenNames = themeTokenNames.filter(isInNoGroup);
  if (tokenNames.length === 0) {
    return <p>Every level 2 token of the library is in one of the groups of this page.</p>;
  }
  return (
    <ScrollableTable caption="Other tokens">
      <ThemeTokenRows tokenNames={tokenNames} sampleKind="none" />
    </ScrollableTable>
  );
}

/**
 * The Tailwind class of each text style. The class has the name of the style.
 * The names are written here in full because Tailwind CSS builds the CSS of a
 * class only when it finds the name in a file of the catalog. The type makes
 * the build fail when the library adds a text style that is not in this list.
 */
const textStyleClasses: Record<TextStyleName, string> = {
  "heading-page": "heading-page",
  "heading-section": "heading-section",
  "heading-card": "heading-card",
  "display-number": "display-number",
  "display-number-sm": "display-number-sm",
  label: "label",
  "label-lg": "label-lg",
  "label-sm": "label-sm",
  "caption-overline": "caption-overline",
};

/** What each text style is for. */
const textStyleUses: Record<TextStyleName, string> = {
  "heading-page": "The title of a page",
  "heading-section": "The title of a section, a dialog or a drawer",
  "heading-card": "The title of a card",
  "display-number": "A large number, for example a total",
  "display-number-sm": "A large number, one size smaller",
  label: "The name of a field, the text of a tab or a badge",
  "label-lg": "A larger label",
  "label-sm": "A smaller label",
  "caption-overline": "A small text in capital letters above a title",
};

/** The CSS properties that have their own column in the table of the text styles. */
const textStyleColumns = ["font-size", "line-height", "font-weight"];

/** The table of the text styles: the class, a sample, what it is for and its values. */
export function TextStyleTable() {
  return (
    <ScrollableTable caption="Text styles">
      <thead>
        <tr>
          <th scope="col">Class</th>
          <th scope="col">Sample</th>
          <th scope="col">Used for</th>
          <th scope="col">Font size</th>
          <th scope="col">Line height</th>
          <th scope="col">Font weight</th>
          <th scope="col">Other</th>
        </tr>
      </thead>
      <tbody>
        {textStyleNames.map((name) => {
          const declarations: Record<string, string> = textStyles[name];
          const otherDeclarations = Object.entries(declarations).filter(
            ([property]) => property !== "font-family" && !textStyleColumns.includes(property),
          );
          return (
            <tr key={name}>
              <th scope="row">
                <code>{name}</code>
              </th>
              <td>
                <span className={textStyleClasses[name]}>
                  {name.startsWith("display-number") ? "1,234.56" : "Toraline"}
                </span>
              </td>
              <td>{textStyleUses[name]}</td>
              {textStyleColumns.map((property) => (
                <td key={property}>{declarations[property]}</td>
              ))}
              <td>
                {otherDeclarations.map(([property, value]) => `${property}: ${value}`).join("; ")}
              </td>
            </tr>
          );
        })}
      </tbody>
    </ScrollableTable>
  );
}

/** One group of level 1 tokens. */
type PrimitiveGroup = {
  caption: string;
  sampleKind: SampleKind;
  includes: (tokenName: string, value: string) => boolean;
};

const primitiveGroups: PrimitiveGroup[] = [
  { caption: "Level 1 colors", sampleKind: "color", includes: (_, value) => value.startsWith("#") },
  {
    caption: "Level 1 font stacks",
    sampleKind: "font",
    includes: (tokenName) => tokenName.startsWith("font-stack-"),
  },
  {
    caption: "Level 1 font sizes",
    sampleKind: "text-size",
    includes: (tokenName) => tokenName.startsWith("font-size-"),
  },
  {
    caption: "Level 1 spacing",
    sampleKind: "space",
    includes: (tokenName) => tokenName.startsWith("space-"),
  },
];

const tableGap: CSSProperties = { display: "grid", gap: "calc(var(--spacing) * 8)" };

/** The tables of the level 1 tokens: the raw values. They are the same in every theme. */
export function PrimitiveTables() {
  const entries = Object.entries(primitives);
  const groups = [
    ...primitiveGroups,
    {
      caption: "Other level 1 tokens",
      sampleKind: "none" as const,
      includes: (tokenName: string, value: string) =>
        primitiveGroups.every((group) => !group.includes(tokenName, value)),
    },
  ];

  return (
    <div style={tableGap}>
      {groups.map((group) => {
        const groupEntries = entries.filter(([tokenName, value]) =>
          group.includes(tokenName, value),
        );
        if (groupEntries.length === 0) {
          return null;
        }
        return (
          <ScrollableTable key={group.caption} caption={group.caption}>
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {groupEntries.map(([tokenName, value]) => (
                <tr key={tokenName}>
                  <th scope="row">
                    <code>--{tokenName}</code>
                  </th>
                  <td>
                    <div className="catalog-token-table__value">
                      {/* A spacing sample draws bars of 1, 2, 4 and 8 units; here one bar is the value. */}
                      {group.sampleKind === "space" ? (
                        <span className="catalog-token-sample" aria-hidden="true">
                          <span
                            className="catalog-token-sample__space"
                            style={{ width: `var(--${tokenName})` }}
                          />
                        </span>
                      ) : (
                        <Sample kind={group.sampleKind} cssValue={`var(--${tokenName})`} />
                      )}
                      <span className="catalog-token-table__raw">{value}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </ScrollableTable>
        );
      })}
    </div>
  );
}

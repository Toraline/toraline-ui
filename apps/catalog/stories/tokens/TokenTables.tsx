import type { CSSProperties, ReactNode } from "react";
import { darkTheme, lightTheme, primitives, themeTokenNames } from "@toraline/tokens";
import type { ThemeTokenName } from "@toraline/tokens";
import "./token-tables.css";

/**
 * The tables of the tokens page. They read the lists and the values of
 * @toraline/tokens, so a token that the library adds or changes appears here
 * with no change in this file.
 *
 * A level 1 token is a raw value, for example --purple-500.
 * A level 2 token is a meaning, for example --color-primary. Each theme gives it a value.
 */

/** The themes of the library, in the order of the columns. */
const libraryThemes = [lightTheme, darkTheme];

/** The text of every font sample and text size sample. */
const sampleText = "Toraline 0123456789";

/** How many spacing units each bar of a spacing sample is wide. */
const spacingSteps = [1, 2, 4, 8];

/** The kinds of sample a table can draw next to a value. */
type SampleKind = "color" | "font" | "text-size" | "space" | "radius" | "shadow" | "none";

/** Draws the sample of one CSS value. "cssValue" is any CSS value, for example "var(--color-primary)". */
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
 * Example: "var(--purple-500)" gives "--purple-500" and "#5e00a1".
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

const themeTokenGroups = {
  colors: {
    caption: "Colors",
    sampleKind: "color",
    includes: (tokenName) => tokenName.startsWith("color-"),
  },
  fonts: {
    caption: "Fonts",
    sampleKind: "font",
    includes: (tokenName) => tokenName.startsWith("font-"),
  },
  textSizes: {
    caption: "Text sizes",
    sampleKind: "text-size",
    includes: (tokenName) => tokenName.startsWith("text-"),
  },
  spacing: {
    caption: "Spacing",
    sampleKind: "space",
    includes: (tokenName) => tokenName === "spacing",
  },
  radius: {
    caption: "Radius",
    sampleKind: "radius",
    includes: (tokenName) => tokenName === "radius",
  },
  shadow: {
    caption: "Shadow",
    sampleKind: "shadow",
    includes: (tokenName) => tokenName === "shadow",
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
  {
    caption: "Level 1 radius sizes",
    sampleKind: "radius",
    includes: (tokenName) => tokenName.startsWith("radius-size-"),
  },
  {
    caption: "Level 1 shadow sizes",
    sampleKind: "shadow",
    includes: (tokenName) => tokenName.startsWith("shadow-size-"),
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

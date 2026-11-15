// @vitest-environment jsdom
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import tailwind from "@tailwindcss/postcss";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import postcss from "postcss";
import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { themeTokenNames } from "@toraline.tech/tokens";
import {
  BreadCrumbs,
  Button,
  ButtonLink,
  IconButton,
  Input,
  SplitButton,
  Tabs,
  Toggle,
  buttonSizes,
  buttonVariants,
  iconButtonSizes,
  iconButtonVariants,
  splitButtonMenuPlacements,
} from "./index";
import { Example, exampleSizes, exampleVariants } from "./template/index";
import { ThemeProvider, ThemeToggle } from "./theme/index";

/**
 * The rules of the styles of every component (TOR-1205):
 * 1. A component is styled only with Tailwind CSS 4 classes. The package has
 *    one CSS file, css/tailwind.css, which only tells Tailwind where the
 *    classes are.
 * 2. Tailwind, with the preset of @toraline.tech/tokens, builds CSS for every
 *    class that a component puts on an element.
 * 3. A color, a font, a font size, a radius and a shadow always come from a
 *    level 2 token. No color is written as a raw value, and no length is in rem.
 * 4. When two classes of one element set the same property, the class of the
 *    state that must win comes later in the built CSS.
 */

// import.meta.dirname is the folder of this file. (In a test with a browser-like
// page, import.meta.url is not a file address, so fileURLToPath cannot be used.)
const sourceFolder = `${import.meta.dirname}/`;
const cssFolder = join(import.meta.dirname, "../css/");
const tokensPreset = join(import.meta.dirname, "../../tokens/css/tailwind.css");

/** Builds the CSS of an app that has these extra lines in its CSS file. */
async function buildCss(lines: string[]): Promise<string> {
  const input = ['@import "tailwindcss" source(none);', `@import "${tokensPreset}";`, ...lines];
  const result = await postcss([tailwind()]).process(input.join("\n"), {
    from: `${cssFolder}app.css`,
  });
  return result.css;
}

/** The part of the built CSS that holds the classes: the cascade layer "utilities". */
function utilitiesLayer(css: string): string {
  const start = css.indexOf("@layer utilities {");
  expect(start).toBeGreaterThan(-1);
  const end = css.indexOf("\n}\n", start);
  return css.slice(start, end);
}

/** The name of a class as Tailwind writes it in a CSS selector. */
const selectorOf = (className: string) => `.${className.replace(/[^a-zA-Z0-9_-]/g, "\\$&")}`;

/** A class that only marks an element for another class ("group/toggle", "peer"). It has no CSS. */
const isMarkerClass = (className: string) => className === "peer" || className.startsWith("group/");

const tabs = [
  { id: "all", label: "All", content: "Every order" },
  { id: "open", label: "Open", content: "The open orders" },
];
const crumbs = [
  { label: "Clients", href: "/clients" },
  { label: "No link" },
  { label: "Fernando Dias", href: "/clients/12" },
];
/** A small icon component, with the props an icon of "lucide-react" accepts. */
function PlusIcon(props: { className?: string; "aria-hidden"?: boolean | "true" | "false" }) {
  return (
    <svg {...props} viewBox="0 0 24 24">
      <path d="M5 12h14M12 5v14" />
    </svg>
  );
}

const menuItems = [{ label: "Send by e-mail", onSelect: () => undefined, icon: <svg /> }];

/** Renders every component in every variant, size and state, and returns every class on the page. */
async function renderEveryComponent(): Promise<string[]> {
  const user = userEvent.setup();
  const { container } = render(
    <ThemeProvider>
      {buttonVariants.map((variant) =>
        buttonSizes.map((size) => (
          <Button key={`${variant}-${size}`} variant={variant} size={size} icon={PlusIcon}>
            Save
          </Button>
        )),
      )}
      {buttonVariants.map((variant) => (
        <Button key={variant} variant={variant} loading>
          Save
        </Button>
      ))}
      {buttonVariants.map((variant) => (
        <ButtonLink key={variant} variant={variant} href="/orders" icon={PlusIcon}>
          Orders
        </ButtonLink>
      ))}
      {iconButtonVariants.map((variant) =>
        iconButtonSizes.map((size) => (
          <IconButton
            key={`${variant}-${size}`}
            variant={variant}
            size={size}
            icon={PlusIcon}
            aria-label={`Add, ${variant}, ${size}`}
          />
        )),
      )}
      <Input label="Title" error="The title is required." />
      <Toggle label="Send e-mails" />
      <Tabs tabs={tabs} />
      <BreadCrumbs crumbs={crumbs} />
      {splitButtonMenuPlacements.map((menuPlacement) => (
        <SplitButton
          key={menuPlacement}
          items={menuItems}
          menuPlacement={menuPlacement}
          menuLabel={`More options, ${menuPlacement}`}
        >
          Download
        </SplitButton>
      ))}
      <ThemeToggle />
      {exampleVariants.map((variant) =>
        exampleSizes.map((size) => (
          <Example key={`${variant}-${size}`} variant={variant} size={size}>
            New
          </Example>
        )),
      )}
    </ThemeProvider>,
  );

  const classNames = new Set<string>();
  const collect = () => {
    for (const element of container.querySelectorAll("[class]")) {
      for (const className of (element.getAttribute("class") ?? "").split(/\s+/)) {
        if (className !== "") {
          classNames.add(className);
        }
      }
    }
  };
  collect();
  // An open menu is on the page only while it is open.
  for (const menuPlacement of splitButtonMenuPlacements) {
    await user.click(screen.getByRole("button", { name: `More options, ${menuPlacement}` }));
    collect();
  }
  return [...classNames];
}

let classNames: string[] = [];
let cssFromSource = "";
let cssOfClasses = "";

beforeAll(async () => {
  classNames = await renderEveryComponent();
  cleanup();
  // What the catalog does: Tailwind reads the source files of the components.
  cssFromSource = await buildCss([`@source "${sourceFolder}";`]);
  // Only the classes that the components put on an element.
  cssOfClasses = await buildCss([`@source inline("${classNames.join(" ")}");`]);
}, 30_000);

afterEach(cleanup);

describe("the package has no CSS of its own", () => {
  test("css/ has one file, tailwind.css, and it only names the built files", () => {
    expect(readdirSync(cssFolder)).toEqual(["tailwind.css"]);
    const css = readFileSync(`${cssFolder}tailwind.css`, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css.trim()).toBe('@source "../dist";');
  });

  test("src/ has no CSS file", () => {
    const fileNames = readdirSync(sourceFolder, { recursive: true }) as string[];
    expect(fileNames.filter((fileName) => fileName.endsWith(".css"))).toEqual([]);
  });
});

describe("Tailwind builds the CSS of every class of the components", () => {
  test("the test found the classes of the components", () => {
    expect(classNames.length).toBeGreaterThan(100);
    expect(classNames).toContain("bg-primary");
    expect(classNames).toContain("focus-visible:outline-focus");
  });

  test("every class has a rule in the CSS that Tailwind builds from the source files", () => {
    const missing = classNames.filter(
      (className) => !isMarkerClass(className) && !cssFromSource.includes(selectorOf(className)),
    );
    expect(missing).toEqual([]);
  });
});

describe("the classes of the components use only tokens", () => {
  test("a color, a font, a font size, the spacing unit, the radius and the shadow are level 2 tokens", () => {
    const tokenNames: readonly string[] = themeTokenNames;
    const utilities = utilitiesLayer(cssOfClasses);
    const variableNames = [...utilities.matchAll(/var\(--([a-z0-9-]+)/g)]
      .map((match) => match[1] as string)
      // The names of a design value. The other variables are Tailwind's own
      // ("--tw-*", "--font-weight-*", "--leading-*", "--default-transition-*").
      .filter(
        (variableName) =>
          /^(bg|text|border|icon|data|color|font|spacing|radius|shadow)(-|$)/.test(variableName) &&
          !variableName.startsWith("font-weight-"),
      );
    expect(variableNames).toContain("bg-primary");
    expect(variableNames).toContain("text-primary");
    expect(variableNames).toContain("border-default");
    expect(variableNames).toContain("border-focus");
    expect(variableNames).toContain("icon-default");
    expect(variableNames).toContain("font-body");
    expect(variableNames).toContain("text-base");
    expect(variableNames).toContain("spacing");
    expect(variableNames).toContain("radius-md");
    expect(variableNames).toContain("radius-lg");
    expect(variableNames).toContain("shadow-lg");
    for (const variableName of new Set(variableNames)) {
      expect(tokenNames, `--${variableName}`).toContain(variableName);
    }
  });

  test("no color is written as a raw value", () => {
    const utilities = utilitiesLayer(cssOfClasses);
    expect(utilities).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(utilities).not.toMatch(/\b(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color-mix)\(/);
  });

  test("no length is written in rem", () => {
    expect(utilitiesLayer(cssOfClasses)).not.toMatch(/\d(\.\d+)?rem\b/);
  });
});

describe("the class of the state that must win comes later in the built CSS", () => {
  // Each pair: [the class that loses, the class that wins]. Both set the same
  // property and can match one element at the same time.
  test.each([
    // Button, and the two buttons of SplitButton: disabled wins over the pointer over it.
    ["hover:bg-primary-hover", "disabled:bg-subtle"],
    ["hover:bg-subtle", "disabled:bg-subtle"],
    ["hover:bg-danger-subtle", "disabled:bg-subtle"],
    ["hover:border-hover", "disabled:border-default"],
    ["border-danger", "disabled:border-default"],
    ["text-danger", "disabled:text-tertiary"],
    ["bg-primary", "hover:bg-primary-hover"],
    ["bg-surface", "hover:bg-subtle"],
    ["bg-primary-subtle", "hover:bg-primary-muted"],
    ["text-body", "hover:text-primary"],
    // IconButton: the pointer over it wins over the look at rest.
    ["text-icon", "hover:text-icon-strong"],
    // Input: the focus wins over the pointer, and disabled wins over both.
    ["border-default", "hover:border-hover"],
    ["hover:border-hover", "focus-visible:border-focus"],
    ["focus-visible:border-focus", "disabled:border-default"],
    ["text-primary", "disabled:text-tertiary"],
    // Toggle: on wins over off, and disabled wins over on.
    ["bg-surface", "peer-checked:bg-primary"],
    ["border-strong", "peer-checked:border-brand"],
    ["peer-checked:bg-primary", "peer-disabled:bg-subtle"],
    ["peer-checked:border-brand", "peer-disabled:border-default"],
    ["bg-current", "group-has-checked/toggle:bg-surface"],
    ["group-has-checked/toggle:bg-surface", "group-has-disabled/toggle:bg-current"],
    ["text-icon", "group-has-disabled/toggle:text-muted"],
    ["text-brand", "group-has-disabled/toggle:text-inverse"],
    ["text-body", "has-disabled:text-tertiary"],
    // Tabs: the selected tab wins over the pointer over it.
    ["hover:text-primary", "aria-selected:text-brand"],
    ["border-b-transparent", "aria-selected:border-b-brand"],
    // SplitButton: the keyboard focus ring wins over the plain focus.
    ["focus:bg-subtle", "focus-visible:outline-2"],
  ])('"%s" comes before "%s"', (losingClass, winningClass) => {
    const losingIndex = cssFromSource.indexOf(`${selectorOf(losingClass)}`);
    const winningIndex = cssFromSource.indexOf(`${selectorOf(winningClass)}`);
    expect(losingIndex).toBeGreaterThan(-1);
    expect(winningIndex).toBeGreaterThan(losingIndex);
  });

  test("the error border of Input applies only to a field that is not disabled", () => {
    expect(cssFromSource).toContain(
      `${selectorOf("aria-invalid:enabled:border-invalid")}[aria-invalid="true"]:enabled`,
    );
  });

  test("a movement or a transition is only for a person who did not ask for less motion", () => {
    const motionClasses = classNames.filter((className) => /(transition|animate|ease)-/.test(className));
    expect(motionClasses.length).toBeGreaterThan(0);
    for (const className of motionClasses) {
      expect(className.startsWith("motion-safe:"), className).toBe(true);
    }
  });
});

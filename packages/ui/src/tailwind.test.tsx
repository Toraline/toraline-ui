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
  Field,
  IconButton,
  SplitButton,
  TabNav,
  Tabs,
  TextInput,
  Toggle,
  buttonSizes,
  controlSizes,
  buttonVariants,
  iconButtonSizes,
  iconButtonVariants,
  splitButtonMenuPlacements,
  tabNavVariants,
} from "./index";
// Phase 8: forms and feedback.
import {
  Checkbox,
  CheckboxControl,
  CountBadge,
  DecimalInput,
  Select,
  StatusBadge,
  Textarea,
  countBadgeVariants,
  statusBadgeVariants,
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
      <Field label="Name" optional hint="As it is written on the invoice.">
        <TextInput />
      </Field>
      <Field label="Name" error="The name is required.">
        <TextInput />
      </Field>
      {controlSizes.map((size) => (
        <TextInput key={size} size={size} icon={PlusIcon} aria-label={`Search, ${size}`} />
      ))}
      <Toggle label="Send e-mails" />
      {tabNavVariants.map((variant) => (
        <TabNav
          key={variant}
          variant={variant}
          items={[
            { href: "/orders", label: "Orders" },
            { href: "/clients", label: "Clients" },
          ]}
          currentPath="/orders"
          aria-label={`Sales, ${variant}`}
        />
      ))}
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
      {/* Phase 8: forms and feedback. */}
      {controlSizes.map((size) => (
        <Select key={size} size={size} aria-label={`Kind of contract, ${size}`}>
          <option>Monthly</option>
        </Select>
      ))}
      <Textarea aria-label="Notes" />
      {controlSizes.map((size) => (
        <DecimalInput key={size} size={size} icon={PlusIcon} aria-label={`Price, ${size}`} />
      ))}
      <Checkbox label="Send the invoice by e-mail" />
      <CheckboxControl aria-label="Paid" />
      <CheckboxControl aria-label="Paid, changed" changed />
      {statusBadgeVariants.map((variant) => (
        <StatusBadge key={variant} variant={variant} label="State" dot />
      ))}
      {countBadgeVariants.map((variant) => (
        <CountBadge key={variant} variant={variant} count={3} label="3 pending orders" />
      ))}
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
    expect(variableNames).toContain("text-xs");
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
    // A breakpoint of Tailwind ("lg:") is a media query with a width in rem. It
    // is Tailwind's own value for the width of the screen, not a length of a
    // component, so the width of a media query is left out of this check.
    const withoutBreakpoints = utilitiesLayer(cssOfClasses).replace(
      /@media \(width >= \d+(\.\d+)?rem\)/g,
      "@media (breakpoint)",
    );
    expect(withoutBreakpoints).toContain("@media (breakpoint)");
    expect(withoutBreakpoints).not.toMatch(/\d(\.\d+)?rem\b/);
  });
});

describe("the class of the state that must win comes later in the built CSS", () => {
  // Each pair: [the class that loses, the class that wins]. Both set the same
  // property and can match one element at the same time.
  test.each([
    // Button, ButtonLink, IconButton and the two buttons of SplitButton: the pointer over it wins over the look at rest.
    ["bg-primary", "hover:bg-primary-hover"],
    ["bg-surface", "hover:bg-subtle"],
    ["bg-surface", "hover:bg-danger-subtle"],
    ["border-default", "hover:border-hover"],
    ["bg-primary-subtle", "hover:bg-primary-muted"],
    ["text-body", "hover:text-primary"],
    ["text-icon", "hover:text-icon-strong"],
    // TextInput: the focus wins over the pointer, a field that is not valid wins over
    // both, and the pointer over a disabled field changes nothing.
    ["hover:border-hover", "focus:border-focus"],
    ["focus:border-focus", "aria-invalid:border-invalid"],
    ["hover:border-hover", "disabled:hover:border-default"],
    ["bg-surface", "disabled:bg-subtle"],
    ["text-primary", "disabled:text-tertiary"],
    // TextInput, size "md": the classes of a wide screen win over the classes of a small one.
    ["min-h-12", "lg:min-h-10"],
    ["py-2.5", "lg:py-2"],
    ["text-base/6", "lg:text-sm/5"],
    // Toggle: on wins over off.
    ["bg-surface", "peer-checked:bg-primary"],
    ["border-strong", "peer-checked:border-brand"],
    ["bg-current", "group-has-checked/toggle:bg-surface"],
    // TabNav: the current tab wins over the look at rest and over the pointer over it.
    ["hover:text-primary", "aria-[current=page]:text-brand"],
    ["hover:text-primary", "aria-[current=page]:text-primary"],
    ["border-transparent", "aria-[current=page]:border-brand"],
    // TabNav: the classes of a wide screen win over the classes of a narrow one.
    ["overflow-x-auto", "md:overflow-visible"],
    // Tabs: the selected tab wins over the pointer over it.
    ["text-secondary", "aria-selected:text-primary"],
    ["hover:text-primary", "aria-selected:text-primary"],
    // SplitButton: the open trigger wins over the look at rest, and the keyboard focus ring wins over the plain focus.
    ["bg-primary", "enabled:aria-expanded:bg-primary-hover"],
    ["focus:bg-subtle", "focus-visible:outline-2"],
    // Phase 8: forms and feedback.
    // Checkbox: checked wins over the look at rest and over the border of a changed value. The pointer over
    // it wins over checked for the border, as in Intraweb, and a checked box has its own darker background.
    ["border-strong", "checked:border-brand"],
    ["border-changed", "checked:border-brand"],
    ["bg-surface", "checked:bg-primary"],
    ["checked:border-brand", "hover:border-hover"],
    ["checked:bg-primary", "checked:hover:bg-primary-hover"],
  ])('"%s" comes before "%s"', (losingClass, winningClass) => {
    const losingIndex = cssFromSource.indexOf(`${selectorOf(losingClass)}`);
    const winningIndex = cssFromSource.indexOf(`${selectorOf(winningClass)}`);
    expect(losingIndex).toBeGreaterThan(-1);
    expect(winningIndex).toBeGreaterThan(losingIndex);
  });

  test("the border of a field that is not valid is selected by aria-invalid", () => {
    expect(cssFromSource).toContain(`${selectorOf("aria-invalid:border-invalid")}[aria-invalid="true"]`);
  });

  test("a movement or a transition is only for a person who did not ask for less motion", () => {
    const motionClasses = classNames.filter((className) => /(transition|animate|ease)-/.test(className));
    expect(motionClasses.length).toBeGreaterThan(0);
    for (const className of motionClasses) {
      expect(className.startsWith("motion-safe:"), className).toBe(true);
    }
  });
});

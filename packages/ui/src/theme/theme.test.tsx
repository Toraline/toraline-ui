// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";
import { ThemeProvider, ThemeToggle, useTheme } from "./index";

const root = document.documentElement;

function CurrentTheme() {
  const { theme } = useTheme();
  return <p data-testid="current-theme">{theme}</p>;
}

afterEach(() => {
  cleanup();
  root.removeAttribute("data-theme");
  document.cookie = "toraline-theme=; Path=/; Max-Age=0";
  document.cookie = "my-theme=; Path=/; Max-Age=0";
});

describe("ThemeProvider", () => {
  test("with nothing saved, shows the first theme and writes it on <html>", () => {
    render(
      <ThemeProvider>
        <CurrentTheme />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("current-theme").textContent).toBe("light");
    expect(root.getAttribute("data-theme")).toBe("light");
  });

  test("starts with the theme the server gives", () => {
    root.setAttribute("data-theme", "dark");
    render(
      <ThemeProvider initialTheme="dark">
        <CurrentTheme />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("current-theme").textContent).toBe("dark");
    expect(root.getAttribute("data-theme")).toBe("dark");
  });

  test("renders the theme the server gives in the HTML of the server", () => {
    const html = renderToString(
      <ThemeProvider initialTheme="dark">
        <ThemeToggle />
      </ThemeProvider>,
    );
    expect(html).toContain("Theme: dark");
  });

  test("takes the theme that a script already wrote on <html>, and does not change it", () => {
    root.setAttribute("data-theme", "dark");
    render(
      <ThemeProvider>
        <CurrentTheme />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("current-theme").textContent).toBe("dark");
    expect(root.getAttribute("data-theme")).toBe("dark");
  });

  test("ignores a theme on <html> that the app does not have", () => {
    root.setAttribute("data-theme", "unknown");
    render(
      <ThemeProvider>
        <CurrentTheme />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("current-theme").textContent).toBe("light");
    expect(root.getAttribute("data-theme")).toBe("light");
  });

  test("setTheme refuses a theme the app does not have", () => {
    function BadButton() {
      const { setTheme } = useTheme();
      return (
        <button
          onClick={() => {
            expect(() => setTheme("unknown")).toThrow(/not a theme of this app/);
          }}
        >
          bad
        </button>
      );
    }
    render(
      <ThemeProvider>
        <BadButton />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByText("bad"));
    expect(root.getAttribute("data-theme")).toBe("light");
  });

  test("useTheme outside the provider throws a clear error", () => {
    expect(() => renderToString(<CurrentTheme />)).toThrow(
      "useTheme must be used inside <ThemeProvider>.",
    );
  });
});

describe("ThemeToggle", () => {
  test("is a real button whose name tells the current theme and the next one", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );
    const toggle = screen.getByRole("button", { name: "Theme: light. Switch to dark." });
    expect(toggle.tagName).toBe("BUTTON");
    expect(toggle.getAttribute("type")).toBe("button");
    expect(toggle.textContent).toBe("Theme: light");
  });

  test("a press changes <html>, the button name, and saves the choice in the cookie", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
        <CurrentTheme />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole("button"));

    expect(root.getAttribute("data-theme")).toBe("dark");
    expect(screen.getByTestId("current-theme").textContent).toBe("dark");
    expect(screen.getByRole("button", { name: "Theme: dark. Switch to light." })).toBeTruthy();
    expect(document.cookie).toContain("toraline-theme=dark");

    fireEvent.click(screen.getByRole("button"));
    expect(root.getAttribute("data-theme")).toBe("light");
    expect(document.cookie).toContain("toraline-theme=light");
  });

  test("goes through every theme of the app and back to the first", () => {
    render(
      <ThemeProvider themes={["sand", "ocean", "night"]} cookieName="my-theme">
        <ThemeToggle />
      </ThemeProvider>,
    );
    const toggle = screen.getByRole("button");
    expect(root.getAttribute("data-theme")).toBe("sand");
    fireEvent.click(toggle);
    expect(root.getAttribute("data-theme")).toBe("ocean");
    fireEvent.click(toggle);
    expect(root.getAttribute("data-theme")).toBe("night");
    expect(document.cookie).toContain("my-theme=night");
    fireEvent.click(toggle);
    expect(root.getAttribute("data-theme")).toBe("sand");
  });

  test("can get focus from the keyboard, and keeps the app's className and children", () => {
    render(
      <ThemeProvider>
        <ThemeToggle className="my-class">Change theme</ThemeToggle>
      </ThemeProvider>,
    );
    const toggle = screen.getByRole("button");
    toggle.focus();
    expect(document.activeElement).toBe(toggle);
    expect(toggle.tabIndex).toBe(0);
    expect(toggle.className.split(" ").at(-1)).toBe("my-class");
    expect(toggle.className.split(" ")).toContain("bg-surface");
    expect(toggle.textContent).toBe("Change theme");
  });
});

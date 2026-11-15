// @vitest-environment jsdom
import { afterEach, describe, expect, test } from "vitest";
import {
  createThemeScript,
  readThemeCookie,
  resolveTheme,
  serializeThemeCookie,
} from "./theme-storage";

const clearThemeCookie = (cookieName = "toraline-theme") => {
  document.cookie = `${cookieName}=; Path=/; Max-Age=0`;
};

/** Runs the script the same way a <script> element in <head> does. */
const runScript = (script: string) => {
  new Function(script)();
};

afterEach(() => {
  clearThemeCookie();
  clearThemeCookie("my-theme");
  document.documentElement.removeAttribute("data-theme");
});

describe("readThemeCookie", () => {
  test("finds the theme among other cookies", () => {
    expect(readThemeCookie("session=abc; toraline-theme=dark; other=1")).toBe("dark");
  });

  test("returns undefined when the cookie is not there", () => {
    expect(readThemeCookie("session=abc")).toBeUndefined();
    expect(readThemeCookie(undefined)).toBeUndefined();
    expect(readThemeCookie("not-toraline-theme=dark")).toBeUndefined();
  });

  test("reads a cookie with another name", () => {
    expect(readThemeCookie("my-theme=ocean", "my-theme")).toBe("ocean");
  });
});

describe("resolveTheme", () => {
  test("keeps a saved theme that the app has", () => {
    expect(resolveTheme("dark", ["light", "dark"])).toBe("dark");
  });

  test("uses the first theme when nothing is saved or the saved theme is unknown", () => {
    expect(resolveTheme(undefined, ["light", "dark"])).toBe("light");
    expect(resolveTheme('"><script>', ["light", "dark"])).toBe("light");
  });

  test("uses the default theme the app gives", () => {
    expect(resolveTheme(undefined, ["light", "dark"], "dark")).toBe("dark");
  });
});

describe("serializeThemeCookie", () => {
  test("builds a cookie for the whole site that lasts 1 year", () => {
    expect(serializeThemeCookie("dark")).toBe(
      "toraline-theme=dark; Path=/; Max-Age=31536000; SameSite=Lax",
    );
  });

  test("refuses a theme name with other characters", () => {
    expect(() => serializeThemeCookie("dark; Domain=example.com")).toThrow(/theme name/);
  });
});

describe("createThemeScript", () => {
  test("writes the saved theme on <html>", () => {
    document.cookie = serializeThemeCookie("dark");
    runScript(createThemeScript());
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  test("writes the default theme when nothing is saved", () => {
    runScript(createThemeScript());
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  test("writes the default theme when the saved theme is not one of the app's themes", () => {
    document.cookie = "toraline-theme=unknown; Path=/";
    runScript(createThemeScript({ themes: ["light", "dark"], defaultTheme: "dark" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  test("works with the app's own themes and cookie name", () => {
    document.cookie = "my-theme=ocean; Path=/";
    runScript(createThemeScript({ themes: ["sand", "ocean"], cookieName: "my-theme" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("ocean");
  });

  test("refuses names that could break out of the script", () => {
    expect(() => createThemeScript({ themes: ["</script>"] })).toThrow(/theme name/);
    expect(() => createThemeScript({ cookieName: "a)|(b" })).toThrow(/cookie name/);
  });
});

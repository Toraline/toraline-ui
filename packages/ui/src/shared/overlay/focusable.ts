/*
 * Which elements inside an overlay the Tab key stops at.
 */

/** The elements that can be in the Tab order. An element with tabindex="-1" is taken out below. */
const tabbableSelector = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  '[contenteditable]:not([contenteditable="false"])',
  "[tabindex]",
].join(", ");

/** false for an element that is not shown: "display: none", "visibility: hidden", or inside such an element. */
function isShown(element: HTMLElement): boolean {
  // jsdom, the browser-like page of the unit tests, does not have checkVisibility.
  if (typeof element.checkVisibility !== "function") {
    return true;
  }
  return element.checkVisibility({ visibilityProperty: true });
}

/** The elements inside the container that the Tab key stops at, in the order of the page. */
export function tabbableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(tabbableSelector)).filter(
    (element) => element.tabIndex >= 0 && element.closest("[inert]") === null && isShown(element),
  );
}

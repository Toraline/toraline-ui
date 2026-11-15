import type { Ref } from "react";

/** One ref function that gives the element to every ref of the list: the ref of the component and the ref of the app. */
export function mergeRefs<Element>(...refs: (Ref<Element> | undefined)[]) {
  return (element: Element | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(element);
      } else if (ref !== undefined && ref !== null) {
        ref.current = element;
      }
    }
  };
}

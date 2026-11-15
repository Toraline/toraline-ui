"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";

export type ScrollBoxProps = Omit<ComponentProps<"div">, "aria-label" | "aria-labelledby" | "ref"> & {
  /** The name of the content, when it is named by "aria-label". */
  "aria-label"?: string;
  /** The id of the element that names the content, for example the caption of a table or the title of a panel. */
  "aria-labelledby"?: string;
};

/**
 * A box that scrolls when its content is larger than the box. The component
 * that uses it gives the classes, "overflow-x-auto" or "overflow-y-auto" among them.
 *
 * Only while the content is larger than the box, the box can get the keyboard
 * focus (tabindex="0"), so a person with a keyboard can scroll it with the
 * arrow keys. It then has role="group" and the name given, so a screen reader
 * says what got the focus. A box whose content fits adds no stop for the Tab key.
 *
 * It runs in the browser because it measures the box. DataTable and
 * DetailPanel use it. It is not exported from the package.
 */
export function ScrollBox({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...divProps
}: ScrollBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [isLargerThanBox, setIsLargerThanBox] = useState(false);

  function measure() {
    const box = boxRef.current;
    if (box !== null) {
      setIsLargerThanBox(box.scrollWidth > box.clientWidth || box.scrollHeight > box.clientHeight);
    }
  }

  // After every render: the content may have changed.
  useEffect(measure);

  // When the box or one of its children changes its size.
  useEffect(() => {
    const box = boxRef.current;
    if (box === null || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    for (const child of box.children) {
      observer.observe(child);
    }
    return () => observer.disconnect();
  }, []);

  const focusProps = isLargerThanBox
    ? {
        tabIndex: 0,
        role: "group",
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
      }
    : {};

  return <div {...divProps} {...focusProps} ref={boxRef} data-scrollable={isLargerThanBox ? "" : undefined} />;
}

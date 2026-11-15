"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";

export type DataTableScrollProps = Omit<ComponentProps<"div">, "aria-label" | "aria-labelledby"> & {
  /** The name of the table, when the table is named by "aria-label". */
  "aria-label"?: string;
  /** The id of the element that names the table: its caption, or the element of "aria-labelledby". */
  "aria-labelledby"?: string;
};

/**
 * The box around the <table> of DataTable. It scrolls sideways when the table
 * is wider than the box.
 *
 * Only while the table is wider than the box, the box can get the keyboard
 * focus (tabindex="0"), so a person with a keyboard can scroll it with the
 * arrow keys. It then has role="group" and the name of the table, so a screen
 * reader says what got the focus. A table that fits adds no stop for the Tab key.
 *
 * It runs in the browser because it measures the box. It is not exported from the package.
 */
export function DataTableScroll({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...divProps
}: DataTableScrollProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [isWiderThanBox, setIsWiderThanBox] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    if (box === null) {
      return undefined;
    }
    const measure = () => setIsWiderThanBox(box.scrollWidth > box.clientWidth);
    measure();
    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    if (box.firstElementChild !== null) {
      observer.observe(box.firstElementChild);
    }
    return () => observer.disconnect();
  }, []);

  const focusProps = isWiderThanBox
    ? {
        tabIndex: 0,
        role: "group",
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
      }
    : {};

  return <div {...divProps} {...focusProps} ref={boxRef} data-scrollable={isWiderThanBox ? "" : undefined} />;
}

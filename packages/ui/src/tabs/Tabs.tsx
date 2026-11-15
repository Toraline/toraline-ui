"use client";

import { useId, useRef, useState } from "react";
import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";
import { segmentedItemClass, segmentedTrackClass } from "../shared/segmented.js";

/*
 * The look is the segmented control of the app Intraweb (SegmentedTabs in
 * components/ui/tab-nav.tsx): a quiet rounded track, where the selected tab is
 * a raised white piece. TabNav (variant "secondary") has the same look.
 */

/** The row of tabs: the track. */
const listClass = segmentedTrackClass;

/** One tab. The selected tab is selected by aria-selected, the attribute a screen reader reads. */
const tabClass = classNames(
  segmentedItemClass,
  "aria-selected:bg-surface aria-selected:text-primary aria-selected:shadow-sm",
);

/** The content of the selected tab. */
const panelClass = classNames("px-0 py-4 text-base/normal text-primary", focusRingClass);

/** One tab: the button a person presses, and the content it shows. */
export type TabItem<TabId extends string = string> = {
  /** A name for the tab that no other tab of the list has. */
  id: TabId;
  /** The text of the tab's button. */
  label: ReactNode;
  /**
   * What the page shows under the row while the tab is selected. It is
   * optional: an app that shows the content itself, somewhere else on the
   * page, gives no content and reads the selected tab from "value".
   */
  content?: ReactNode;
};

export type TabsProps<TabId extends string = string> = Omit<
  ComponentProps<"div">,
  "onChange" | "defaultValue"
> & {
  /** The tabs, in the order they are shown. */
  tabs: readonly TabItem<TabId>[];
  /**
   * The id of the selected tab, when the app holds the state (controlled).
   * Give it together with "onChange".
   */
  value?: TabId;
  /** Called with the id of a tab when a person selects it. */
  onChange?: (value: TabId) => void;
  /**
   * The id of the tab that is selected at the start, when the component holds
   * the state (uncontrolled). When missing: the first tab.
   */
  defaultValue?: TabId;
};

/**
 * A row of tabs that changes the content inside one page. To move between
 * pages, use TabNav.
 *
 * - Two ways to hold the state. Uncontrolled: the component holds it, and
 *   "defaultValue" names the first selected tab. Controlled: the app gives
 *   "value" and "onChange".
 * - When the selected tab has "content", the component shows it under the row.
 * - Keyboard: Tab moves the focus to the selected tab. The Left and Right arrow
 *   keys move to the tab before or after it and select it; after the last tab
 *   comes the first. Home selects the first tab and End the last.
 * - Screen reader: the selected tab has aria-selected="true".
 * - "aria-label" and "aria-labelledby" name the row of tabs.
 * - "className" and every other prop go to the outermost <div>, and "ref" points to it.
 */
export function Tabs<TabId extends string = string>({
  tabs,
  value,
  onChange,
  defaultValue,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...divProps
}: TabsProps<TabId>) {
  const baseId = useId();
  const [ownValue, setOwnValue] = useState(defaultValue);
  const tabElements = useRef<(HTMLButtonElement | null)[]>([]);

  const wantedId = value ?? ownValue;
  const foundIndex = tabs.findIndex((tab) => tab.id === wantedId);
  const selectedIndex = foundIndex === -1 ? 0 : foundIndex;
  const selectedTab = tabs[selectedIndex];

  const select = (index: number) => {
    const tab = tabs[index];
    if (tab === undefined) {
      return;
    }
    setOwnValue(tab.id);
    if (tab.id !== selectedTab?.id) {
      onChange?.(tab.id);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = tabs.length - 1;
    const targets: Record<string, number> = {
      ArrowRight: index === lastIndex ? 0 : index + 1,
      ArrowLeft: index === 0 ? lastIndex : index - 1,
      Home: 0,
      End: lastIndex,
    };
    const targetIndex = targets[event.key];
    if (targetIndex === undefined) {
      return;
    }
    event.preventDefault();
    tabElements.current[targetIndex]?.focus();
    select(targetIndex);
  };

  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = `${baseId}-panel`;
  // A tab with no content has no panel: the app shows the content itself.
  const hasPanel = selectedTab !== undefined && selectedTab.content !== undefined;

  return (
    <div {...divProps} className={classNames("font-body", className)}>
      <div
        role="tablist"
        className={listClass}
        data-slot="list"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {tabs.map((tab, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabElements.current[index] = element;
              }}
              type="button"
              role="tab"
              id={tabId(index)}
              className={tabClass}
              data-slot="tab"
              aria-selected={isSelected}
              aria-controls={isSelected && hasPanel ? panelId : undefined}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {hasPanel ? (
        <div
          role="tabpanel"
          id={panelId}
          className={panelClass}
          data-slot="panel"
          aria-labelledby={tabId(selectedIndex)}
          tabIndex={0}
        >
          {selectedTab.content}
        </div>
      ) : null}
    </div>
  );
}

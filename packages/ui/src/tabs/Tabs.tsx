"use client";

import { useId, useRef, useState } from "react";
import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";

/** One tab: the button a person presses, and the content it shows. */
export type TabItem = {
  /** A name for the tab that no other tab of the list has. */
  id: string;
  /** The text of the tab's button. */
  label: ReactNode;
  /** What the page shows while the tab is selected. */
  content: ReactNode;
};

export type TabsProps = ComponentProps<"div"> & {
  /** The tabs, in the order they are shown. */
  tabs: readonly TabItem[];
  /** The id of the tab that is selected at the start. When missing: the first tab. */
  defaultSelectedId?: string;
  /**
   * The id of the selected tab, when the app holds the state.
   * Give it together with "onSelectedIdChange".
   */
  selectedId?: string;
  /** Called with the id of a tab when a person selects it. */
  onSelectedIdChange?: (selectedId: string) => void;
};

/**
 * A row of tabs, and under it the content of the selected tab.
 *
 * - Keyboard: Tab moves the focus to the selected tab. The Left and Right arrow
 *   keys move to the tab before or after it and select it; after the last tab
 *   comes the first. Home selects the first tab and End the last.
 * - Screen reader: the selected tab has aria-selected="true".
 * - "aria-label" and "aria-labelledby" name the row of tabs.
 * - "className" and every other prop go to the outermost <div>, and "ref" points to it.
 */
export function Tabs({
  tabs,
  defaultSelectedId,
  selectedId,
  onSelectedIdChange,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...divProps
}: TabsProps) {
  const baseId = useId();
  const [ownSelectedId, setOwnSelectedId] = useState(defaultSelectedId);
  const tabElements = useRef<(HTMLButtonElement | null)[]>([]);

  const wantedId = selectedId ?? ownSelectedId;
  const foundIndex = tabs.findIndex((tab) => tab.id === wantedId);
  const selectedIndex = foundIndex === -1 ? 0 : foundIndex;
  const selectedTab = tabs[selectedIndex];

  const select = (index: number) => {
    const tab = tabs[index];
    if (tab === undefined) {
      return;
    }
    setOwnSelectedId(tab.id);
    if (tab.id !== selectedTab?.id) {
      onSelectedIdChange?.(tab.id);
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

  return (
    <div {...divProps} className={classNames("tui-tabs", className)}>
      <div
        role="tablist"
        className="tui-tabs__list"
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
              className="tui-tabs__tab"
              aria-selected={isSelected}
              aria-controls={isSelected ? panelId : undefined}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {selectedTab === undefined ? null : (
        <div
          role="tabpanel"
          id={panelId}
          className="tui-tabs__panel"
          aria-labelledby={tabId(selectedIndex)}
          tabIndex={0}
        >
          {selectedTab.content}
        </div>
      )}
    </div>
  );
}

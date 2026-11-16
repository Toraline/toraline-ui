"use client";

import { useState } from "react";
import { Tabs } from "@toraline.tech/ui";

const modes = [
  { id: "write", label: "Write" },
  { id: "preview", label: "Preview" },
] as const;

type Mode = (typeof modes)[number]["id"];

/**
 * Tabs with the state held by the app ("value" and "onChange"), as the
 * SegmentedTabs of the app Intraweb. The tabs have no content: this component
 * shows the content itself. It is a Client Component because it holds state.
 */
export function ControlledTabsExample() {
  const [mode, setMode] = useState<Mode>("write");

  return (
    <div className="grid w-full gap-2">
      <div>
        <Tabs tabs={modes} value={mode} onChange={setMode} aria-label="Mode of the editor" />
      </div>
      <p data-testid="controlled-tabs-mode">The mode the app holds: {mode}</p>
    </div>
  );
}

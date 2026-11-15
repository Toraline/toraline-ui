"use client";

import { useState } from "react";
import { SplitButton } from "@toraline/ui";

/**
 * The examples of SplitButton. This file is a Client Component because the
 * actions of the menu are functions, and it keeps the last action in state.
 */
export function SplitButtonExamples() {
  const [lastAction, setLastAction] = useState("none");

  const items = [
    { label: "Download the invoice", onSelect: () => setLastAction("Download the invoice") },
    { label: "Download the contract", onSelect: () => setLastAction("Download the contract") },
    { label: "Send by e-mail", onSelect: () => setLastAction("Send by e-mail") },
  ];

  return (
    <>
      <p className="mt-4" data-testid="last-action">
        Last action: {lastAction}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <SplitButton items={items} onClick={() => setLastAction("Download all")}>
          Download all
        </SplitButton>
        <SplitButton
          items={items}
          menuPlacement="top"
          menuLabel="More options, the menu opens upwards"
          onClick={() => setLastAction("Download all (upwards)")}
        >
          Opens upwards
        </SplitButton>
        <SplitButton items={items} menuLabel="More options, disabled" disabled>
          Disabled
        </SplitButton>
        <SplitButton
          items={items}
          menuLabel="More options, with a class of the app"
          className="shadow"
          onClick={() => setLastAction("Download all (shadow)")}
        >
          With a class of the app (shadow)
        </SplitButton>
      </div>
    </>
  );
}

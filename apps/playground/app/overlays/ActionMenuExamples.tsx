"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { ActionMenu, Modal } from "@toraline.tech/ui";

/**
 * The examples of ActionMenu. This file is a Client Component: the actions of
 * a menu are functions, and an icon component cannot come from a Server Component.
 */
export function ActionMenuExamples() {
  const [lastAction, setLastAction] = useState("none");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const items = [
    { key: "edit", label: "Edit", icon: Pencil, onSelect: () => setLastAction("Edit") },
    { key: "copy", label: "Copy", icon: Copy, onSelect: () => setLastAction("Copy") },
    {
      key: "delete",
      label: "Delete",
      icon: Trash2,
      onSelect: () => setLastAction("Delete"),
      disabled: true,
      hint: "Ana has open orders.",
    },
    { key: "modal", label: "Open a Modal", onSelect: () => setIsModalOpen(true) },
  ];

  return (
    <>
      <p className="mt-4" data-testid="last-menu-action">
        Last action: {lastAction}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <ActionMenu items={items} aria-label="Actions of Ana" />
        <ActionMenu items={items} aria-label="Actions of the list" trigger="button">
          Actions
        </ActionMenu>
        <ActionMenu items={items} aria-label="Actions, disabled" disabled />
      </div>
      <div className="mt-4 flex justify-end">
        <ActionMenu items={items} aria-label="Actions at the right edge" />
      </div>
      {isModalOpen ? (
        <Modal title="Opened from the menu" size="md" onClose={() => setIsModalOpen(false)}>
          <p className="text-sm/5 text-body">
            When this dialog closes, the focus goes back to the button that opened the menu.
          </p>
          <div className="mt-4">
            <ActionMenu items={items.slice(0, 2)} aria-label="Actions inside the dialog" />
          </div>
        </Modal>
      ) : null}
    </>
  );
}

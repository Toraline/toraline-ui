"use client";

import { useState } from "react";
import { Button, Field, Modal, TextInput, modalSizes } from "@toraline.tech/ui";
import type { ModalSize } from "@toraline.tech/ui";

/**
 * The examples of Modal. This file is a Client Component: it keeps which
 * dialog is open in state, and "onClose" is a function.
 */
export function ModalExamples() {
  const [openSize, setOpenSize] = useState<ModalSize | null>(null);
  const [isNestedOpen, setIsNestedOpen] = useState(false);
  const close = () => setOpenSize(null);

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {modalSizes.map((size) => (
          <Button key={size} variant="secondary" onClick={() => setOpenSize(size)}>
            Open the Modal, size {size}
          </Button>
        ))}
      </div>
      {openSize === null ? null : (
        <Modal title={`New client (size ${openSize})`} size={openSize} onClose={close}>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              close();
            }}
          >
            <Field label="Name">
              <TextInput name="name" />
            </Field>
            <Field label="E-mail" optional>
              <TextInput name="email" type="email" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsNestedOpen(true)}>
                Open a second Modal
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Modal>
      )}
      {isNestedOpen ? (
        <Modal title="A second Modal" size="md" onClose={() => setIsNestedOpen(false)}>
          <p className="text-sm/5 text-body">Escape closes only this dialog. The first one stays open.</p>
        </Modal>
      ) : null}
    </>
  );
}

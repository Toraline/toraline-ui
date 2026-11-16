"use client";

import { useState } from "react";
import { Button, Drawer, Field, TextInput } from "@toraline.tech/ui";

/**
 * The examples of Drawer. This file is a Client Component: it keeps which
 * panel is open in state, and "onClose" is a function.
 */
export function DrawerExamples() {
  const [open, setOpen] = useState<"narrow" | "wide" | null>(null);
  const [clicks, setClicks] = useState(0);
  const close = () => setOpen(null);

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={() => setOpen("narrow")}>
          Open the Drawer
        </Button>
        <Button variant="secondary" onClick={() => setOpen("wide")}>
          Open the wide Drawer
        </Button>
        <Button variant="ghost" onClick={() => setClicks(clicks + 1)}>
          A button of the page
        </Button>
        <span data-testid="page-clicks">Presses on the button of the page: {clicks}</span>
      </div>
      {open === null ? null : (
        <Drawer
          title={open === "wide" ? "Order 12 (wide)" : "Order 12"}
          wide={open === "wide"}
          onClose={close}
          footer={
            <>
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" form="playground-order-form">
                Save
              </Button>
            </>
          }
        >
          <form
            id="playground-order-form"
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              close();
            }}
          >
            <Field label="Client">
              <TextInput name="client" />
            </Field>
            <Field label="Note" optional>
              <TextInput name="note" />
            </Field>
          </form>
        </Drawer>
      )}
    </>
  );
}

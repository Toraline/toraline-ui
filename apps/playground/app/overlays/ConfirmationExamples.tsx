"use client";

import { useState } from "react";
import { Button, DeleteOverlay, DiscardConfirmation, Drawer, Field, Modal, TextInput } from "@toraline.tech/ui";

/** The texts of the question "discard the changes?". The library has none: the app gives them. */
const discardTexts = {
  title: "Discard the changes?",
  description: "You typed something that is not saved yet. If you leave now, these changes are lost.",
  discardLabel: "Discard",
  keepEditingLabel: "Keep editing",
};

/**
 * The examples of DiscardConfirmation and DeleteOverlay. This file is a Client
 * Component: it keeps what is open in state, and the answers are functions.
 */
export function ConfirmationExamples() {
  const [open, setOpen] = useState<"question" | "modal" | "drawer" | "delete" | "blocked" | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [lastAnswer, setLastAnswer] = useState("none");
  const close = () => setOpen(null);

  const form = (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <Field label="Name" hint="Type here, then close without saving: the question opens.">
        <TextInput name="name" />
      </Field>
      <div className="flex justify-end">
        <Button type="submit">Save</Button>
      </div>
    </form>
  );

  return (
    <>
      <p className="mt-4" data-testid="last-answer">
        Last answer: {lastAnswer}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={() => setOpen("question")}>
          Show the question
        </Button>
        <Button variant="secondary" onClick={() => setOpen("modal")}>
          A Modal that asks
        </Button>
        <Button variant="secondary" onClick={() => setOpen("drawer")}>
          A Drawer that asks
        </Button>
        <Button variant="danger" onClick={() => setOpen("delete")}>
          Delete the product
        </Button>
        <Button variant="danger" onClick={() => setOpen("blocked")}>
          Delete a product that is in use
        </Button>
      </div>

      {open === "question" ? (
        <DiscardConfirmation
          {...discardTexts}
          onDiscard={() => {
            setLastAnswer("discard");
            close();
          }}
          onKeepEditing={() => {
            setLastAnswer("keep editing");
            close();
          }}
        />
      ) : null}
      {open === "modal" ? (
        <Modal title="New client" size="md" discardConfirmation={discardTexts} onClose={close}>
          {form}
        </Modal>
      ) : null}
      {open === "drawer" ? (
        <Drawer title="New client" discardConfirmation={discardTexts} onClose={close}>
          {form}
        </Drawer>
      ) : null}
      {open === "delete" ? (
        <DeleteOverlay
          title="Delete"
          cancelLabel="Cancel"
          deleteLabel="Delete"
          pendingLabel="Deleting…"
          closeLabel="Close"
          consequence="Its prices and its recipe are deleted too."
          pending={isPending}
          onDelete={() => {
            // A real app calls its API here.
            setIsPending(true);
            window.setTimeout(() => {
              setIsPending(false);
              setLastAnswer("deleted");
              close();
            }, 800);
          }}
          onClose={close}
        >
          Delete the product &quot;Brownie&quot;? This cannot be undone.
        </DeleteOverlay>
      ) : null}
      {open === "blocked" ? (
        <DeleteOverlay
          title="Delete"
          cancelLabel="Cancel"
          deleteLabel="Delete"
          closeLabel="Close"
          blockedTitle="It cannot be deleted"
          blocked={<p className="text-body">The product is used by 2 orders. Remove it from them first.</p>}
          onDelete={close}
          onClose={close}
        >
          Delete the product &quot;Brownie&quot;?
        </DeleteOverlay>
      ) : null}
    </>
  );
}

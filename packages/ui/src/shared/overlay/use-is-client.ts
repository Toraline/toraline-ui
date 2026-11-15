"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

/**
 * false while the server renders the page and while the browser takes over
 * that HTML (hydration), true after. An overlay is rendered into <body> (a
 * portal), and the server has no <body> to render into.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

import type { CSSProperties, ReactNode } from "react";

const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "calc(var(--spacing) * 4)",
};

/** Shows several examples of a component next to each other, with the same space between them. */
export function Row({ children }: { children: ReactNode }) {
  return <div style={rowStyle}>{children}</div>;
}

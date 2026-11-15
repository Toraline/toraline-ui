import { expect, test } from "vitest";
import { packageName } from "./index";

test("the ui package is reachable", () => {
  expect(packageName).toBe("@toraline.tech/ui");
});

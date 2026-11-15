import { expect, test } from "vitest";
import { packageName } from "./index";

test("the tokens package is reachable", () => {
  expect(packageName).toBe("@toraline.tech/tokens");
});

import { screen } from "@testing-library/react";
import Button from "./Button";
import { renderWrapper } from "../../config/test";

it("Button should exists", () => {
  renderWrapper(<Button />);

  expect(screen.getByText("oi")).toBeInTheDocument();
});

import { render, screen } from "@testing-library/react";
import ViewportButton from "../../src/components/Viewport/ViewportButton";

it("renders viewport button", () => {
  render(<ViewportButton />);
  expect(screen.getByRole("button")).toBeDefined();
});
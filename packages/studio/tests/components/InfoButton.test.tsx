import { render, screen } from "@testing-library/react";
import InfoButton from "../../src/components/InfoButton";
import userEvent from "@testing-library/user-event";

it("correctly renders the info modal when icon is clicked", async () => {
  render(<InfoButton />)
  await userEvent.click(screen.getByRole("button"));
  expect(screen.getByText("Studio Info")).toBeDefined();
});
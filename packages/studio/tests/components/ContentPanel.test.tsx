import { render, screen } from "@testing-library/react";
import ContentPanel from "../../src/components/ContentPanel";
import { mockRepeaterActiveComponent } from "../__utils__/mockRepeaterActiveComponent";

it("renders repeated component's props for a Repeater", () => {
  mockRepeaterActiveComponent();
  render(<ContentPanel />);
  screen.getByText("text");
  expect(screen.getAllByRole("textbox")[0]).toHaveValue("test");
});

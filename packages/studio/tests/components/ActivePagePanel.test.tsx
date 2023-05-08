import { render, screen } from "@testing-library/react";
import ActivePagePanel from "../../src/components/ActivePagePanel";
import { mockPageSliceStates } from "../__utils__/mockPageSliceState";

it("displays ErrorPageStates in the ActivePagePanel with correct tooltips", () => {
  mockPageSliceStates({
    errorPages: {
      ErrorPage: {
        message: "This message is the reason the page could not be rendered",
      },
    },
  });
  render(<ActivePagePanel />);
  expect(screen.getByText("ErrorPage")).toBeTruthy();
  expect(
    screen.getByText(
      "This message is the reason the page could not be rendered"
    )
  ).toBeTruthy();
});

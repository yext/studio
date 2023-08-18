import { render, screen } from "@testing-library/react";
import ViewportButton from "../../src/components/Viewport/ViewportButton";
import useStudioStore from "../../src/store/useStudioStore";
import userEvent from "@testing-library/user-event";

it("renders viewport button", () => {
  render(<ViewportButton />);
  expect(screen.getByRole("button")).toBeDefined();
  expect(useStudioStore.getState().pagePreview.viewport.name).toEqual(
    "Reset Viewport"
  );
});

it("can change viewport", async () => {
  render(<ViewportButton />);
  await userEvent.click(screen.getByRole("button"));
  expect(screen.getByText("iPhone SE")).toBeDefined();
  await userEvent.click(screen.getByText("iPhone SE"));
  expect(useStudioStore.getState().pagePreview.viewport.name).toEqual(
    "iPhone SE"
  );
  expect(
    useStudioStore.getState().pagePreview.viewport.styles.height
  ).toEqual(667);
  expect(
    useStudioStore.getState().pagePreview.viewport.styles.width
  ).toEqual(375);
  expect(
    useStudioStore.getState().pagePreview.viewport.type
  ).toEqual("mobile");
});

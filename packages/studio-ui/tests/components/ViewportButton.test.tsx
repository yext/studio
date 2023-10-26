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
  expect(useStudioStore.getState().pagePreview.viewport).toMatchObject({
    name: "iPhone SE",
    styles: {
      height: 667,
      width: 375,
    },
    type: "mobile",
    css: "w-[375px] h-[667px]",
  });
});

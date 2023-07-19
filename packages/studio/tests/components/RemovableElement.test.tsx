import { render, screen } from "@testing-library/react";
import RemovableElement from "../../src/components/RemovableElement";
import userEvent from "@testing-library/user-event";


it("calls the onRemove function when clicked", async () => {

  const onRemoveFunction = jest.fn();

  render(<RemovableElement onRemove={onRemoveFunction} />);
  const removableElementButton = screen.getByRole("button");
  await userEvent.click(removableElementButton);

  expect(onRemoveFunction).toBeCalled();
});

import { within, screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HighlightedPreview from "../../src/components/HighlightedPreview";
import useStudioStore from "../../src/store/useStudioStore";
import { mockStoreNestedComponentState } from "../__fixtures__/mockStoreNestedComponents";
import mockStore from "../__utils__/mockStore";

it("clicking a component in the preview updates the activeComponentUUID", async () => {
  mockStore(mockStoreNestedComponentState);
  render(<HighlightedPreview />);
  expect(useStudioStore.getState().pages.activeComponentUUID).toEqual(
    undefined
  );
  const container1 = await screen.findByText(/Container 1/);
  await userEvent.click(container1);
  expect(useStudioStore.getState().pages.activeComponentUUID).toEqual(
    "container-uuid"
  );
  const banner1 = await within(container1).findByText(/Banner 1/);
  await userEvent.click(banner1);
  expect(useStudioStore.getState().pages.activeComponentUUID).toEqual(
    "banner-uuid"
  );
});

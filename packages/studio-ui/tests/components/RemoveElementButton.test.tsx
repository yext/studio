import { render, screen } from "@testing-library/react";
import RemoveElementButton from "../../src/components/RemoveElementButton";
import { mockPageSliceStates } from "../__utils__/mockPageSliceState";
import { ComponentStateKind } from "@yext/studio-plugin";
import useStudioStore from "../../src/store/useStudioStore";
import userEvent from "@testing-library/user-event";
import { searchBarComponent } from "../__fixtures__/componentStates";

beforeEach(() => {
  mockPageSliceStates({
    pages: {
      universal: {
        componentTree: [
          {
            kind: ComponentStateKind.Fragment,
            uuid: "mock-uuid-0",
          },
          {
            ...searchBarComponent,
            uuid: "mock-uuid-1",
            parentUUID: "mock-uuid-0",
          },
          {
            ...searchBarComponent,
            uuid: "mock-uuid-2",
            parentUUID: "mock-uuid-1",
          },
          {
            ...searchBarComponent,
            uuid: "mock-uuid-3",
            parentUUID: "mock-uuid-0",
          },
        ],
        styleImports: [],
        filepath: "mock-filepath",
      },
    },
    activePageName: "universal",
    activeComponentUUID: "mock-uuid-1",
  });
});

it("removes element from component tree and updates the store", async () => {
  const removeComponentSpy = jest.spyOn(
    useStudioStore.getState().actions,
    "removeComponent"
  );
  render(<RemoveElementButton elementUUID="mock-uuid-1" />);
  const removeElementButton = screen.getByRole("button");
  await userEvent.click(removeElementButton);

  expect(removeComponentSpy).toBeCalledWith("mock-uuid-1");
  expect(useStudioStore.getState().pages.activeComponentUUID).toBeUndefined();
});

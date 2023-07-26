import { render, screen } from "@testing-library/react";
import useStudioStore from "../../src/store/useStudioStore";
import userEvent from "@testing-library/user-event";
import ComponentTree from "../../src/components/ComponentTree";
import mockStoreActiveComponent from "../__utils__/mockActiveComponentState";
import { ComponentStateKind, FileMetadataKind } from "@yext/studio-plugin";

it("removes the page when page delete button is clicked", async () => {
  mockStoreActiveComponent({
    activeComponent: {
      kind: ComponentStateKind.Standard,
      componentName: "name",
      props: {},
      uuid: "mock-uuid-1",
      metadataUUID: "mock-metadata-uuid-1",
    },
    activeComponentMetadata: {
      kind: FileMetadataKind.Component,
      metadataUUID: "mock-metadata-uuid-1",
      filepath: "mock-filepath",
    },
  });
  const removeComponentSpy = jest.spyOn(
    useStudioStore.getState().actions,
    "removeComponent"
  );

  render(<ComponentTree />);
  const removeComponentButton = screen.getByRole("button", {
    name: "Remove Element",
  });
  expect(useStudioStore.getState().pages.activeComponentUUID).toBeDefined();
  await userEvent.click(removeComponentButton);
  expect(removeComponentSpy).toBeCalledWith("mock-uuid-1");
  expect(useStudioStore.getState().pages.activeComponentUUID).toBeUndefined();
});

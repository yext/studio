import { act, render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import useStudioStore from "../../src/store/useStudioStore";
import ComponentTree from "../../src/components/ComponentTree";
import mockComponentTree from "../__utils__/mockComponentTree";
import {
  containerComponent,
  child1Component,
} from "../__fixtures__/componentStates";
import {
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  StandardComponentState,
} from "@yext/studio-plugin";

const mockActiveComponent: StandardComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "component-name",
  props: {},
  uuid: "mock-uuid-1",
  metadataUUID: "active-metadata-uuid",
};
const mockActiveComponentMetadata: FileMetadata = {
  kind: FileMetadataKind.Component,
  metadataUUID: "active-metadata-uuid",
  filepath: "mock-filepath1",
};
const mockContainerComponentMetadata: FileMetadata = {
  kind: FileMetadataKind.Component,
  metadataUUID: "container-metadata-uuid",
  filepath: "mock-filepath2",
};
const mockChild1ComponentMetadata: FileMetadata = {
  kind: FileMetadataKind.Component,
  metadataUUID: "child1-metadata-uuid",
  filepath: "mock-filepath3",
};
const mockUUIDToFileMetadata: Record<string, FileMetadata> = {
  "active-metadata-uuid": mockActiveComponentMetadata,
  "container-metadata-uuid": mockContainerComponentMetadata,
  "child1-metadata-uuid": mockChild1ComponentMetadata,
};

describe("Keyboard macros", () => {
  beforeEach(() => {
    mockComponentTree({
      componentTree: [mockActiveComponent, containerComponent, child1Component],
      UUIDToFileMetadata: mockUUIDToFileMetadata,
      activeComponentUUID: mockActiveComponent.uuid,
    });
  });
  describe("delete key shortcut", () => {
    it("delete key calls function to remove the active component", () => {
      const removeComponentSpy = jest.spyOn(
        useStudioStore.getState().actions,
        "removeSelectedComponents"
      );
      render(<ComponentTree />);
      const activeComponent = screen.getByText("component-name");
      act(() => activeComponent.click());
      expect(useStudioStore.getState().pages.activeComponentUUID).toBe(
        "mock-uuid-1"
      );
      fireEvent.keyDown(activeComponent, { key: "Backspace" });
      expect(removeComponentSpy).toBeCalled();
      expect(
        useStudioStore.getState().pages.activeComponentUUID
      ).toBeUndefined();
      expect(
        useStudioStore.getState().pages.selectedComponentUUIDs.size
      ).toEqual(0);
    });

    it("does not remove the active component during text input deletion", async () => {
      const removeComponentSpy = jest.spyOn(
        useStudioStore.getState().actions,
        "removeSelectedComponents"
      );
      render(
        <>
          <ComponentTree />
          <input type="text" defaultValue="erase me" />
        </>
      );
      const activeComponent = screen.getByText("component-name");
      act(() => activeComponent.click());
      expect(useStudioStore.getState().pages.activeComponentUUID).toBe(
        "mock-uuid-1"
      );
      const textInput = screen.getByRole("textbox");
      await userEvent.type(textInput, "{backspace}");
      expect(removeComponentSpy).toBeCalledTimes(0);
      expect(screen.getByText("component-name")).toBeDefined();
      expect(textInput).toHaveValue("erase m");
    });
  });

  describe("shift key shortcut", () => {
    it("shift click calls function to add selected components", () => {
      Object.defineProperty(
        useStudioStore.getState().pages,
        "addShiftSelectedComponentUUIDs",
        {
          value: jest.fn(),
        }
      );

      const addShiftSpy = jest.spyOn(
        useStudioStore.getState().pages,
        "addShiftSelectedComponentUUIDs"
      );
      render(<ComponentTree />);
      const activeComponent = screen.getByText("component-name");
      const childComponent = screen.getByText("Child1");
      act(() => activeComponent.click());
      expect(useStudioStore.getState().pages.activeComponentUUID).toBe(
        "mock-uuid-1"
      );
      fireEvent.click(childComponent, { shiftKey: true });
      expect(addShiftSpy).toBeCalledWith(child1Component);
    });
  });
});

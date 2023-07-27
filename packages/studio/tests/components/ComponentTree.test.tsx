import { act, render, screen, renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import useStudioStore from "../../src/store/useStudioStore";
import ComponentTree from "../../src/components/ComponentTree";
import useDeleteKeyListener from "../../src/hooks/useDeleteKeyListener";
import mockStoreActiveComponent from "../__utils__/mockActiveComponentState";
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
  metadataUUID: "mock-metadata-uuid-1",
};
const mockactiveComponentMetadata: FileMetadata = {
  kind: FileMetadataKind.Component,
  metadataUUID: "mock-metadata-uuid-1",
  filepath: "mock-filepath",
};

describe("delete key shortcut", () => {
  beforeEach(() => {
    mockStoreActiveComponent({
      activeComponent: mockActiveComponent,
      activeComponentMetadata: mockactiveComponentMetadata,
    });
  });

  it("removes the active component with the delete key", async () => {
    const removeComponentSpy = jest.spyOn(
      useStudioStore.getState().actions,
      "removeComponent"
    );
    // creates a mapping between the keydown event and its event handler
    const map = {};
    document.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });
    render(<ComponentTree />);
    renderHook(() => useDeleteKeyListener());
    const activeComponent = screen.getByText("component-name");
    activeComponent.click();
    expect(useStudioStore.getState().pages.activeComponentUUID).toBe(
      "mock-uuid-1"
    );
    await act(() => map["keydown"]({ key: "Backspace" }));
    expect(removeComponentSpy).toBeCalledWith("mock-uuid-1");
    expect(useStudioStore.getState().pages.activeComponentUUID).toBeUndefined();
    expect(screen.queryByText("component-name")).toBeNull();
  });

  it("does not remove the active component during text input deletion", async () => {
    const removeComponentSpy = jest.spyOn(
      useStudioStore.getState().actions,
      "removeComponent"
    );
    const handleChange = () => {
      return false;
    };
    render(
      <>
        <ComponentTree />
        <input type="text" value="erase me" onChange={handleChange} />
      </>
    );
    renderHook(() => useDeleteKeyListener());
    const activeComponent = screen.getByText("component-name");
    activeComponent.click();
    expect(useStudioStore.getState().pages.activeComponentUUID).toBe(
      "mock-uuid-1"
    );
    const textInput = screen.getByRole("textbox");
    await userEvent.type(textInput, "{backspace}");
    expect(removeComponentSpy).toBeCalledTimes(0);
    expect(textInput).toHaveValue("erase m");
    expect(screen.getByText("component-name")).toBeDefined();
  });
});

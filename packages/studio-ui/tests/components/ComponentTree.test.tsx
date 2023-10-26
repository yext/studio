import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import useStudioStore from "../../src/store/useStudioStore";
import ComponentTree from "../../src/components/ComponentTree";
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
  styleImports: [],
};

describe("delete key shortcut", () => {
  beforeEach(() => {
    mockStoreActiveComponent({
      activeComponent: mockActiveComponent,
      activeComponentMetadata: mockactiveComponentMetadata,
    });
  });

  it("delete key calls function to remove the active component", () => {
    const removeComponentSpy = jest.spyOn(
      useStudioStore.getState().actions,
      "removeComponent"
    );
    render(<ComponentTree />);
    const activeComponent = screen.getByText("component-name");
    activeComponent.click();
    expect(useStudioStore.getState().pages.activeComponentUUID).toBe(
      "mock-uuid-1"
    );
    fireEvent.keyDown(activeComponent, { key: "Backspace" });
    expect(removeComponentSpy).toBeCalledWith("mock-uuid-1");
  });

  it("does not remove the active component during text input deletion", async () => {
    const removeComponentSpy = jest.spyOn(
      useStudioStore.getState().actions,
      "removeComponent"
    );
    render(
      <>
        <ComponentTree />
        <input type="text" defaultValue="erase me" />
      </>
    );
    const activeComponent = screen.getByText("component-name");
    activeComponent.click();
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

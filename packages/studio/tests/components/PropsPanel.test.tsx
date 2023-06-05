import {
  ComponentMetadata,
  ComponentStateKind,
  FileMetadataKind,
  ModuleMetadata,
  ModuleState,
  StandardComponentState,
} from "@yext/studio-plugin";
import mockStoreActiveComponent from "../__utils__/mockActiveComponentState";
import PropsPanel from "../../src/components/PropsPanel";
import { render, screen } from "@testing-library/react";
import { mockRepeaterActiveComponent } from "../__utils__/mockRepeaterActiveComponent";

it("does not render prop editor(s) for fragment component", () => {
  mockStoreActiveComponent({
    activeComponent: {
      kind: ComponentStateKind.Fragment,
      uuid: "fragment-uuid",
    },
  });
  const { container } = render(<PropsPanel />);
  expect(container).toBeEmptyDOMElement();
});

it("does not render prop editor(s) when there's no selected active component", () => {
  mockStoreActiveComponent({});
  const { container } = render(<PropsPanel />);
  expect(container).toBeEmptyDOMElement();
});

it("does not render 'Create Module' button for Standard Component", () => {
  const state: StandardComponentState = {
    kind: ComponentStateKind.Standard,
    componentName: "Standard",
    props: {},
    uuid: "1234",
    metadataUUID: "5678",
  };
  const metadata: ComponentMetadata = {
    kind: FileMetadataKind.Component,
    filepath: "/some/file",
    metadataUUID: "5678",
    propShape: {},
  };

  mockStoreActiveComponent({
    activeComponent: state,
    activeComponentMetadata: metadata,
  });

  render(<PropsPanel />);
  expect(screen.queryByText("Create Module")).toBeNull();
});

it("renders Module Actions for Active Module", () => {
  const state: ModuleState = {
    kind: ComponentStateKind.Module,
    componentName: "Test",
    props: {},
    uuid: "1234",
    metadataUUID: "5678",
  };
  const metadata: ModuleMetadata = {
    kind: FileMetadataKind.Module,
    filepath: "/some/file",
    metadataUUID: "5678",
    propShape: {},
    componentTree: [],
  };

  mockStoreActiveComponent({
    activeComponent: state,
    activeComponentMetadata: metadata,
  });

  render(<PropsPanel />);
  expect(screen.getAllByRole("button")).toHaveLength(3);
  screen.getByRole("button", { name: "Edit Module Test" });
  screen.getByRole("button", { name: "Detach Module Test" });
  screen.getByRole("button", { name: "Delete Module file" });
});

describe("Repeaters", () => {
  it("renders repeated component's props", () => {
    mockRepeaterActiveComponent();
    render(<PropsPanel />);
    screen.getByText("num");
    expect(screen.getByRole("spinbutton")).toHaveValue(5);
  });

  it("does not render Create Module button for a repeated component", () => {
    mockRepeaterActiveComponent();
    render(<PropsPanel />);
    expect(screen.queryByText("Create Module")).toBeNull();
  });

  it("renders Module Actions for a repeated module", () => {
    mockRepeaterActiveComponent(true);
    render(<PropsPanel />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
    const editButton = screen.getByRole("button", { name: "Edit Module Mod" });
    expect(editButton).toBeEnabled();
    const detachButton = screen.getByRole("button", {
      name: "Detach Module Mod",
    });
    expect(detachButton).toBeDisabled();
    const deleteButton = screen.getByRole("button", {
      name: "Delete Module file",
    });
    expect(deleteButton).toBeDisabled();
  });
});

it("renders repeated component's props for a Repeater", () => {
  mockRepeaterActiveComponent();
  render(<PropsPanel />);
  screen.getByText("text");
  expect(screen.getAllByRole("textbox")[0]).toHaveValue("test");
});

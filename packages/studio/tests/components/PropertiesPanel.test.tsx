import {
  ComponentMetadata,
  ComponentStateKind,
  FileMetadataKind,
  ModuleMetadata,
  ModuleState,
  StandardComponentState,
} from "@yext/studio-plugin";
import mockStoreActiveComponent from "../__utils__/mockActiveComponentState";
import PropertiesPanel from "../../src/components/PropertiesPanel";
import { render, screen } from "@testing-library/react";

it("does not render prop editor(s) for fragment component", () => {
  mockStoreActiveComponent({
    activeComponent: {
      kind: ComponentStateKind.Fragment,
      uuid: "fragment-uuid",
    },
  });
  const { container } = render(<PropertiesPanel />);
  expect(container).toBeEmptyDOMElement();
});

it("does not render prop editor(s) when there's no selected active component", () => {
  mockStoreActiveComponent({});
  const { container } = render(<PropertiesPanel />);
  expect(container).toBeEmptyDOMElement();
});

it("renders 'Create Module' button for Standard Component", () => {
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

  render(<PropertiesPanel />);
  expect(screen.getAllByRole("button")).toHaveLength(1);
  screen.getByRole("button", { name: "Create Module" });
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

  render(<PropertiesPanel />);
  expect(screen.getAllByRole("button")).toHaveLength(3);
  screen.getByRole("button", { name: "Edit Module Test" });
  screen.getByRole("button", { name: "Detach Module Test" });
  screen.getByRole("button", { name: "Delete Module file" });
});

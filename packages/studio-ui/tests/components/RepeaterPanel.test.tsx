import { ComponentStateKind, FileMetadataKind } from "@yext/studio-plugin";
import mockStoreActiveComponent from "../__utils__/mockActiveComponentState";
import { render, screen } from "@testing-library/react";
import { mockRepeaterActiveComponent } from "../__utils__/mockRepeaterActiveComponent";
import RepeaterPanel from "../../src/components/RepeaterPanel";

it("does not render panel for non-repeater component", () => {
  mockStoreActiveComponent({
    activeComponent: {
      kind: ComponentStateKind.Standard,
      uuid: "banner-uuid",
      metadataUUID: "metadata-uuid",
      componentName: "Banner",
      props: {},
    },
    activeComponentMetadata: {
      kind: FileMetadataKind.Component,
      filepath: "/some/file",
      metadataUUID: "metadata-uuid",
      propShape: {},
    },
  });
  const { container } = render(<RepeaterPanel />);
  expect(container).toBeEmptyDOMElement();
});

it("only renders message for repeated component", () => {
  mockRepeaterActiveComponent();
  render(<RepeaterPanel />);
  expect(
    screen.getByText(
      "This component is repeated in a list. Please contact a developer to edit the list settings."
    )
  ).toBeDefined();
  expect(screen.queryByText("List")).toBeFalsy();
  expect(screen.queryByRole("checkbox")).toBeFalsy();
  expect(screen.queryByText("List Field")).toBeFalsy();
  expect(screen.queryByRole("textbox")).toBeFalsy();
});

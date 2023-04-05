import {
  ComponentMetadata,
  ComponentStateKind,
  FileMetadataKind,
  PropMetadata,
  PropValueKind,
  PropValueType,
  RepeaterState,
} from "@yext/studio-plugin";
import { render, screen } from "@testing-library/react";
import ContentPanel, {
  getPropValueKind,
} from "../../src/components/ContentPanel";
import mockStoreActiveComponent from "../__utils__/mockActiveComponentState";

describe("getPropValueKind works as expected", () => {
  it("returns Literal for string union prop", () => {
    const stringUnionMetadata: PropMetadata = {
      required: false,
      type: PropValueType.string,
      unionValues: ["a", "b"],
    };

    expect(getPropValueKind(stringUnionMetadata)).toBe(PropValueKind.Literal);
  });

  it("returns Expression for simple string prop", () => {
    const stringMetadata: PropMetadata = {
      required: false,
      type: PropValueType.string,
    };

    expect(getPropValueKind(stringMetadata)).toBe(PropValueKind.Expression);
  });
});

it("renders repeated component's props for a Repeater", () => {
  const state: RepeaterState = {
    kind: ComponentStateKind.Repeater,
    uuid: "1234",
    listExpression: "someList",
    repeatedComponent: {
      kind: ComponentStateKind.Standard,
      componentName: "Standard",
      props: {
        text: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.string,
          value: "test",
        },
      },
      metadataUUID: "5678",
    },
  };
  const metadata: ComponentMetadata = {
    kind: FileMetadataKind.Component,
    filepath: "/some/file",
    metadataUUID: "5678",
    propShape: {
      text: {
        type: PropValueType.string,
        required: false,
      },
    },
  };

  mockStoreActiveComponent({
    activeComponent: state,
    activeComponentMetadata: metadata,
  });

  render(<ContentPanel />);
  screen.getByText("text");
  expect(screen.getAllByRole("textbox")[0]).toHaveValue("test");
});

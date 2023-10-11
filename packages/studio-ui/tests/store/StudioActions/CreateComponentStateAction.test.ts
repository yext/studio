import {
  ComponentMetadata,
  ComponentStateKind,
  FileMetadataKind,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import { ComponentState } from "react";
import useStudioStore from "../../../src/store/useStudioStore";

it("creates the expected component state", () => {
  const componentMetadata: ComponentMetadata = {
    kind: FileMetadataKind.Component,
    filepath: "./blah/AddedComp.tsx",
    metadataUUID: "unused",
    cssImports: [],
  };

  const expectedState: ComponentState = {
    kind: ComponentStateKind.Standard,
    componentName: "AddedComp",
    uuid: expect.any(String),
    props: {},
    metadataUUID: "unused",
  };
  const actualState = useStudioStore
    .getState()
    .actions.createComponentState(componentMetadata);
  expect(actualState).toEqual(expectedState);
});

it("adds default values for required props", () => {
  const componentMetadata: ComponentMetadata = {
    kind: FileMetadataKind.Component,
    filepath: "./Component.tsx",
    metadataUUID: "unused",
    propShape: {
      document: {
        type: PropValueType.Record,
        recordKey: "string",
        recordValue: "any",
        required: true,
      },
      optionalArr: {
        type: PropValueType.Array,
        itemType: { type: PropValueType.number },
        required: false,
      },
      requiredString: {
        type: PropValueType.string,
        required: true,
      },
    },
    cssImports: [],
  };

  const actualState = useStudioStore
    .getState()
    .actions.createComponentState(componentMetadata);

  expect(actualState).toEqual(
    expect.objectContaining({
      props: {
        document: {
          kind: PropValueKind.Expression,
          value: "document",
          valueType: PropValueType.Record,
        },
        requiredString: {
          kind: PropValueKind.Literal,
          value: "",
          valueType: PropValueType.string,
        },
      },
    })
  );
});

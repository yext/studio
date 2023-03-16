import {
  ComponentMetadata,
  ComponentStateKind,
  FileMetadataKind,
  ModuleMetadata,
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

describe("isPagesJSRepo behavior", () => {
  it("adds document prop to modules when isPageJSRepo = true", () => {
    useStudioStore.setState((state) => {
      state.studioConfig.isPagesJSRepo = true;
    });

    const moduleMetadata: ModuleMetadata = {
      kind: FileMetadataKind.Module,
      filepath: "./ModuleLol.tsx",
      componentTree: [],
      metadataUUID: "unused",
    };

    const actualState = useStudioStore
      .getState()
      .actions.createComponentState(moduleMetadata);

    expect(actualState).toEqual(
      expect.objectContaining({
        props: {
          document: {
            kind: PropValueKind.Expression,
            value: "document",
            valueType: PropValueType.Record,
          },
        },
      })
    );
  });

  it("doesn't add document prop to regular components when isPageJSRepo = true", () => {
    useStudioStore.setState((state) => {
      state.studioConfig.isPagesJSRepo = true;
    });
    const actualState = useStudioStore.getState().actions.createComponentState({
      kind: FileMetadataKind.Component,
      filepath: "./blah/Component.tsx",
      propShape: {},
      metadataUUID: "-metadatUUID-",
    });

    expect(actualState).toEqual(
      expect.objectContaining({
        props: {},
      })
    );
  });
});

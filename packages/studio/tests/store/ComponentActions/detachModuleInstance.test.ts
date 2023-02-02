import {
  ComponentState,
  ComponentStateKind,
  FileMetadataKind,
  ModuleMetadata,
  ModuleState,
} from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";

it("can detach module instances", () => {
  const moduleMetadata: ModuleMetadata = {
    kind: FileMetadataKind.Module,
    metadataUUID: "my-module",
    filepath: "unuesd",
    componentTree: [
      {
        kind: ComponentStateKind.Standard,
        componentName: "Container",
        uuid: "button-0",
        props: {},
        metadataUUID: "container-metadata",
      },
      {
        kind: ComponentStateKind.Standard,
        componentName: "Banner",
        uuid: "banner-0",
        props: {},
        metadataUUID: "banner-metadata",
        parentUUID: "button-0",
      },
    ],
  };
  const tree: ComponentState[] = [
    {
      kind: ComponentStateKind.BuiltIn,
      componentName: "div",
      uuid: "div-0",
      props: {},
    },
    {
      kind: ComponentStateKind.Module,
      componentName: "MyModule",
      props: {},
      uuid: "module-0",
      metadataUUID: "my-module",
      parentUUID: "div-0",
    },
    {
      kind: ComponentStateKind.BuiltIn,
      componentName: "div",
      uuid: "div-1",
      props: {},
      parentUUID: "div-0",
    },
  ];
  mockStore({
    pages: {
      activePageName: "testpage",
      pages: {
        testpage: {
          componentTree: tree,
          cssImports: [],
          filepath: "unused",
        },
      },
    },
    fileMetadatas: {
      UUIDToFileMetadata: {
        "my-module": moduleMetadata,
      },
    },
  });
  useStudioStore
    .getState()
    .actions.detachModuleInstance(moduleMetadata, tree[1] as ModuleState);
  const actualTree = useStudioStore.getState().actions.getComponentTree();
  expect(actualTree).toEqual([
    tree[0],
    {
      ...moduleMetadata.componentTree[0],
      uuid: expect.any(String),
      parentUUID: "div-0",
    },
    {
      ...moduleMetadata.componentTree[1],
      uuid: expect.any(String),
      parentUUID: actualTree?.[1]?.uuid,
    },
    tree[2],
  ]);
});

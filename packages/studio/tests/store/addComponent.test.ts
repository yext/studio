import { ComponentStateKind, FileMetadataKind } from "@yext/studio-plugin";
import useStudioStore from "../../src/store/useStudioStore";
import mockStore from "../__utils__/mockStore";

it("adds components to ModuleMetadata when a module is being edited", () => {
  const initialTree = [
    {
      kind: ComponentStateKind.Standard,
      componentName: "AComponent",
      uuid: "unused",
      props: {},
      metadataUUID: "unused",
    },
  ];
  mockStore({
    fileMetadatas: {
      UUIDToFileMetadata: {
        StarModuleMetadataUUID: {
          kind: FileMetadataKind.Module,
          componentTree: initialTree,
          metadataUUID: "StarModuleMetadataUUID",
          filepath: "unused",
        },
      },
    },
    pages: {
      moduleUUIDBeingEdited: "ModuleState.uuid",
      activePageName: "pagename",
      pages: {
        pagename: {
          componentTree: [
            {
              kind: ComponentStateKind.Module,
              uuid: "ModuleState.uuid",
              metadataUUID: "StarModuleMetadataUUID",
              componentName: "StarModule",
              props: {},
            },
          ],
          cssImports: [],
          filepath: "unused",
        },
      },
    },
  });

  const newComponentState = {
    kind: ComponentStateKind.Standard,
    componentName: "AddedComp",
    uuid: "added-comp",
    props: {},
    metadataUUID: "metadata-uuid",
  };
  useStudioStore.getState().addComponent(newComponentState);
  expect(
    useStudioStore.getState().fileMetadatas.UUIDToFileMetadata[
      "StarModuleMetadataUUID"
    ]
  ).toEqual(
    expect.objectContaining({
      componentTree: [...initialTree, newComponentState],
    })
  );
});

it("adds components to the active PageState when no module is being edited", () => {
  const initialTree = [
    {
      kind: ComponentStateKind.Standard,
      componentName: "AComponent",
      uuid: "unused",
      props: {},
      metadataUUID: "unused",
    },
  ];
  mockStore({
    pages: {
      activePageName: "pagename",
      pages: {
        pagename: {
          componentTree: initialTree,
          cssImports: [],
          filepath: "unused",
        },
      },
    },
  });

  const newComponentState = initialTree[0];
  useStudioStore.getState().addComponent(newComponentState);
  const updatedTree =
    useStudioStore.getState().pages.pages["pagename"].componentTree;
  expect(updatedTree).toEqual([...initialTree, newComponentState]);
});

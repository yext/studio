import { ComponentStateKind, FileMetadataKind } from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";

it("removes components from ModuleMetadata when a module is being edited", () => {
  const initialTree = [
    {
      kind: ComponentStateKind.Standard,
      componentName: "AComponent",
      uuid: "remove-uuid",
      props: {},
      metadataUUID: "unused",
    },
    {
      kind: ComponentStateKind.Standard,
      componentName: "AComponent",
      uuid: "dont-remove-uuid",
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
  useStudioStore.getState().actions.removeComponent("remove-uuid");
  expect(
    useStudioStore.getState().fileMetadatas.UUIDToFileMetadata[
      "StarModuleMetadataUUID"
    ]
  ).toEqual(
    expect.objectContaining({
      componentTree: [initialTree[1]],
    })
  );
});

it("adds components to the active PageState when no module is being edited", () => {
  const initialTree = [
    {
      kind: ComponentStateKind.Standard,
      componentName: "AComponent",
      uuid: "remove-uuid",
      props: {},
      metadataUUID: "unused",
    },
    {
      kind: ComponentStateKind.Standard,
      componentName: "AComponent",
      uuid: "dont-remove-uuid",
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

  useStudioStore.getState().actions.removeComponent("remove-uuid");
  const updatedTree =
    useStudioStore.getState().pages.pages["pagename"].componentTree;
  expect(updatedTree).toEqual([initialTree[1]]);
});

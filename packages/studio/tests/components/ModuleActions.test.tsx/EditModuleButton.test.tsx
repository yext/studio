import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ComponentStateKind,
  FileMetadataKind,
  ModuleMetadata,
  ModuleState,
} from "@yext/studio-plugin";
import EditModuleButton from "../../../src/components/ModuleActions/EditModuleButton";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";

it("sets module UUID being edited and resets active component when clicked", async () => {
  const moduleState: ModuleState = {
    kind: ComponentStateKind.Module,
    componentName: "Star",
    props: {},
    uuid: "first-comp-state",
    metadataUUID: "star-metadata-uuid",
  };
  const testModuleMetadata: ModuleMetadata = {
    kind: FileMetadataKind.Module,
    metadataUUID: "star-metadata-uuid",
    componentTree: [
      {
        kind: ComponentStateKind.Standard,
        componentName: "Banner",
        props: {},
        uuid: "will-be-replaced",
        metadataUUID: "banner-metadata-uuid",
      },
    ],
    filepath: "unused/Star.tsx",
  };

  mockStore({
    pages: {
      activeComponentUUID: "first-comp-state",
      pages: {
        firstPage: {
          componentTree: [moduleState],
          cssImports: [],
          filepath: "unused",
        },
      },
    },
    fileMetadatas: {
      UUIDToFileMetadata: {
        "star-metadata-uuid": testModuleMetadata,
      },
    },
  });

  render(<EditModuleButton state={moduleState} />);
  const editButton = await screen.findByRole("button", {
    name: "Edit Module Star",
  });
  await userEvent.click(editButton);
  expect(useStudioStore.getState().pages.moduleUUIDBeingEdited).toEqual(
    "first-comp-state"
  );
  expect(useStudioStore.getState().pages.activeComponentUUID).toBeUndefined();
});

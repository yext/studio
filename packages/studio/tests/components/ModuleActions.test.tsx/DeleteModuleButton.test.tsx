import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ComponentStateKind,
  FileMetadataKind,
  ModuleMetadata,
  PageState,
} from "@yext/studio-plugin";
import DeleteModuleButton from "../../../src/components/ModuleActions/DeleteModuleButton";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";

it("can open modal and delete modules", async () => {
  const basicPageState: PageState = {
    componentTree: [
      {
        kind: ComponentStateKind.Module,
        componentName: "Star",
        props: {},
        uuid: "first-comp-state",
        metadataUUID: "star-metadata-uuid",
      },
    ],
    cssImports: [],
    filepath: "unused",
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
      activeComponentUUID: "will be unset after",
      pages: {
        firstPage: basicPageState,
      },
    },
    fileMetadatas: {
      UUIDToFileMetadata: {
        "star-metadata-uuid": testModuleMetadata,
      },
    },
  });

  render(<DeleteModuleButton metadata={testModuleMetadata} />);
  const openModalButton = await screen.findByRole("button", {
    name: "Delete Module Star",
  });
  await userEvent.click(openModalButton);
  const deleteModuleConfirmation = await screen.findByRole("button", {
    name: "Delete",
  });
  await userEvent.click(deleteModuleConfirmation);
  expect(useStudioStore.getState().pages.activeComponentUUID).toBeUndefined();
  expect(useStudioStore.getState().pages.pages).toEqual({
    firstPage: expect.objectContaining({
      componentTree: [
        expect.objectContaining({ kind: ComponentStateKind.Standard }),
      ],
    }),
  });
  expect(useStudioStore.getState().fileMetadatas.UUIDToFileMetadata).toEqual(
    {}
  );
});

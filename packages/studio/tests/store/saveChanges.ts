import useStudioStore from "../../src/store/useStudioStore";
import * as sendMessageModule from "../../src/messaging/sendMessage";
import mockStore from "../__utils__/mockStore";
import { FileMetadata, FileMetadataKind, MessageID } from "@yext/studio-plugin";
import { PagesRecord } from "../../src/store/models/slices/PageSlice";

const mockPages: PagesRecord = {
  UpdateMe: {
    componentTree: [],
    cssImports: [],
    filepath: "some/file/path",
  },
};

const mockUUIDToFileMetadata: Record<string, FileMetadata> = {
  "module-uuid": {
    kind: FileMetadataKind.Module,
    componentTree: [],
    metadataUUID: "module-uuid",
    filepath: "mock-filepath",
  },
};

beforeEach(() => {
  mockStore({
    pages: {
      pages: mockPages,
      pendingChanges: {
        pagesToRemove: new Set(["RemoveMe"]),
        pagesToUpdate: new Set(["UpdateMe"]),
      },
    },
    fileMetadatas: {
      UUIDToFileMetadata: mockUUIDToFileMetadata,
      pendingChanges: {
        modulesToUpdate: new Set(["module-uuid"]),
      },
    },
  });
});

it("sends pending changes to server to update files", () => {
  const sendMessageSpy = jest.spyOn(sendMessageModule, "default");
  useStudioStore.getState().saveChanges();
  expect(sendMessageSpy).toBeCalledTimes(1);
  expect(sendMessageSpy).toBeCalledWith(MessageID.SaveChanges, {
    pageNameToPageState: mockPages,
    UUIDToFileMetadata: mockUUIDToFileMetadata,
    pendingChanges: {
      pagesToRemove: ["RemoveMe"],
      pagesToUpdate: ["UpdateMe"],
      modulesToUpdate: ["module-uuid"],
    },
    siteSettings: {
      values: undefined,
    },
  });
});

it("resets pending changes on successful response from server after saving changes", () => {
  useStudioStore.getState().saveChanges();
  expect(useStudioStore.getState().pages.pendingChanges).toEqual({
    pagesToRemove: new Set(),
    pagesToUpdate: new Set(),
  });
  expect(useStudioStore.getState().fileMetadatas.pendingChanges).toEqual({
    modulesToUpdate: new Set(),
  });
});

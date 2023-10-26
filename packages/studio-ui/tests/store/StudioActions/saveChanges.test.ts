import useStudioStore from "../../../src/store/useStudioStore";
import * as sendMessageModule from "../../../src/messaging/sendMessage";
import mockStore from "../../__utils__/mockStore";
import { MessageID } from "@yext/studio-plugin";
import { PagesRecord } from "../../../src/store/models/slices/PageSlice";

const mockPages: PagesRecord = {
  UpdateMe: {
    componentTree: [],
    styleImports: [],
    filepath: "some/file/path",
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
  });
});

it("sends pending changes to server to update files", async () => {
  const sendMessageSpy = jest.spyOn(sendMessageModule, "default");
  await useStudioStore.getState().actions.saveChanges();
  expect(sendMessageSpy).toBeCalledTimes(1);
  expect(sendMessageSpy).toBeCalledWith(MessageID.SaveChanges, {
    pageNameToPageState: mockPages,
    pendingChanges: {
      pagesToRemove: ["RemoveMe"],
      pagesToUpdate: ["UpdateMe"],
    },
    siteSettings: {
      values: undefined,
    },
  });
});

it("resets pending changes on successful response from server after saving changes", async () => {
  await useStudioStore.getState().actions.saveChanges();
  expect(useStudioStore.getState().pages.pendingChanges).toEqual({
    pagesToRemove: new Set(),
    pagesToUpdate: new Set(),
  });
});

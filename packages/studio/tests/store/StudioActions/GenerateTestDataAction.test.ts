import useStudioStore from "../../../src/store/useStudioStore";
import { mockPageSliceStates } from "../../__utils__/mockPageSliceState";
import * as sendMessageModule from "../../../src/messaging/sendMessage";
import { ResponseType } from "@yext/studio-plugin";

describe("updateEntityFiles", () => {
  it("updates previously undefined entityFiles", async () => {
    mockPageSliceStates({
      pages: getPagesRecord(),
      activePageName: "test",
    });
    mockMessage({ test: ["mockLocalData.json"] });
    await useStudioStore.getState().actions.generateTestData();
    const pageSlice = useStudioStore.getState().pages;
    expect(pageSlice.pages["test"].pagesJS?.entityFiles).toEqual([
      "mockLocalData.json",
    ]);
    expect(pageSlice.activeEntityFile).toEqual("mockLocalData.json");
    expect(pageSlice.activePageEntities).toEqual({
      "mockLocalData.json": expect.anything(),
    });
  });

  it("updates entityFiles to undefined when no test data is generated", async () => {
    mockPageSliceStates({
      pages: getPagesRecord(["mockLocalData.json"]),
      activePageName: "test",
      activeEntityFile: "mockLocalData.json",
      activePageEntities: { "mockLocalData.json": { name: "test" } },
    });
    mockMessage({}, true);
    await useStudioStore.getState().actions.generateTestData();
    const pageSlice = useStudioStore.getState().pages;
    expect(pageSlice.pages["test"].pagesJS?.entityFiles).toBeUndefined();
    expect(pageSlice.activeEntityFile).toBeUndefined();
    expect(pageSlice.activePageEntities).toBeUndefined();
  });

  it("does not update entityFiles if there was no change", async () => {
    mockPageSliceStates({
      pages: getPagesRecord(["mockLocalData.json"]),
      activePageName: "test",
      activeEntityFile: "mockLocalData.json",
      activePageEntities: { "mockLocalData.json": { name: "test" } },
    });
    mockMessage({ test: ["mockLocalData.json"] });
    const setEntityFilesSpy = jest.spyOn(
      useStudioStore.getState().pages,
      "setEntityFiles"
    );
    const setActiveEntityFileSpy = jest.spyOn(
      useStudioStore.getState().pages,
      "setActiveEntityFile"
    );
    const setActivePageEntitiesSpy = jest.spyOn(
      useStudioStore.getState().pages,
      "setActivePageEntities"
    );
    const spies = [
      setEntityFilesSpy,
      setActiveEntityFileSpy,
      setActivePageEntitiesSpy,
    ];
    spies.forEach((spy) => expect(spy).toBeCalledTimes(0));
    await useStudioStore.getState().actions.generateTestData();
    spies.forEach((spy) => expect(spy).toBeCalledTimes(0));
    const pageSlice = useStudioStore.getState().pages;
    expect(pageSlice.pages["test"].pagesJS?.entityFiles).toEqual([
      "mockLocalData.json",
    ]);
    expect(pageSlice.activeEntityFile).toEqual("mockLocalData.json");
    expect(pageSlice.activePageEntities).toEqual({
      "mockLocalData.json": { name: "test" },
    });
  });

  it("does not update active entities if only data for non-active pages are regenerated", async () => {
    mockPageSliceStates({ pages: getPagesRecord() });
    mockMessage({ test: ["mockLocalData.json"] });
    await useStudioStore.getState().actions.generateTestData();
    const pageSlice = useStudioStore.getState().pages;
    expect(pageSlice.pages["test"].pagesJS?.entityFiles).toEqual([
      "mockLocalData.json",
    ]);
    expect(pageSlice.activeEntityFile).toBeUndefined();
    expect(pageSlice.activePageEntities).toBeUndefined();
  });
});

function mockMessage(mappingJson: Record<string, string[]>, isError = false) {
  jest.spyOn(sendMessageModule, "default").mockImplementation(() => {
    return new Promise((resolve) =>
      resolve({
        msg: "msg",
        type: isError ? ResponseType.Error : ResponseType.Success,
        mappingJson,
      })
    );
  });
}

function getPagesRecord(entityFiles?: string[]) {
  return {
    test: {
      componentTree: [],
      cssImports: [],
      filepath: "mock-filepath",
      pagesJS: {
        getPathValue: undefined,
        streamScope: {},
        entityFiles,
      },
    },
  };
}

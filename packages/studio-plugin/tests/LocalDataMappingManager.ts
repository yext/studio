
import upath from "upath";
import LocalDataMappingManager from "../src/LocalDataMappingManager"

it("throws when localData's mapping.json file doesn't exist", () => {
  const manager = new LocalDataMappingManager("thisFolderDoesNotExist", true)
  expect(() => manager.getMapping()).toThrow(
    /^The localData's mapping.json does not exist/
  );
});

it("can fetch the local data mapping file", () => {
  const localDataPath = upath.resolve(__dirname, "../__fixtures__/ParsingOrchestrator/localData")
  const manager = new LocalDataMappingManager(localDataPath, true)
  const localDataMappingPromise = manager.getMapping();
  expect(localDataMappingPromise).toEqual({
    basicPage: ["basicpage-stream.json"],
  });
});

it("returns undefined when not in a PagesJS repo", () => {
  const manager = new LocalDataMappingManager("unused", false)
  const localDataMappingPromise = manager.getMapping();
  expect(localDataMappingPromise).toEqual(undefined);
})

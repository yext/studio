
import upath from "upath";
import LocalDataMappingManager from "../src/LocalDataMappingManager"

it("throws when localData's mapping.json file doesn't exist", async () => {
  const manager = new LocalDataMappingManager("thisFolderDoesNotExist", true)
  const localDataMappingPromise = manager.getLocalDataMapping();
  await expect(localDataMappingPromise).rejects.toThrow(
    /^The localData's mapping.json does not exist/
  );
});

it("can fetch the local data mapping file", async () => {
  const localDataPath = upath.resolve(__dirname, "../__fixtures__/ParsingOrchestrator/localData")
  const manager = new LocalDataMappingManager(localDataPath, true)
  const localDataMappingPromise = await manager.getLocalDataMapping();
  expect(localDataMappingPromise).toEqual({
    basicPage: ["basicpage-stream.json"],
  });
});

it("returns undefined when not in a PagesJS repo", async () => {
  const manager = new LocalDataMappingManager("unused", false)
  const localDataMappingPromise = await manager.getLocalDataMapping();
  expect(localDataMappingPromise).toEqual(undefined);
})

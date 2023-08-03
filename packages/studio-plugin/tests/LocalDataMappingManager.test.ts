import upath from "upath";
import LocalDataMappingManager from "../src/LocalDataMappingManager";

it("throws when localData's mapping.json file doesn't exist", () => {
  expect(() => new LocalDataMappingManager("thisFolderDoesNotExist")).toThrow(
    /^The localData's mapping.json does not exist/
  );
});

it("can fetch the local data mapping file", () => {
  const localDataPath = upath.resolve(
    __dirname,
    "./__fixtures__/ParsingOrchestrator/localData"
  );
  const manager = new LocalDataMappingManager(localDataPath);
  const mapping = manager.getMapping();
  expect(mapping).toEqual({
    basicPage: ["basicpage-stream.json"],
  });
});

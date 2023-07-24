import getLocalDataMapping from "../../src/parsers/getLocalDataMapping";
import upath from "upath";

it("throws when localData's mapping.json file doesn't exist", async () => {
  const localDataMappingPromise = getLocalDataMapping("thisFolderDoesNotExist");
  await expect(localDataMappingPromise).rejects.toThrow(
    /^The localData's mapping.json does not exist/
  );
});

it("can fetch the local data mapping file", async () => {
  const localDataMappingPromise = await getLocalDataMapping(
    upath.resolve(__dirname, "../__fixtures__/ParsingOrchestrator/localData")
  );
  expect(localDataMappingPromise).toEqual({
    basicPage: ["basicpage-stream.json"],
  });
});

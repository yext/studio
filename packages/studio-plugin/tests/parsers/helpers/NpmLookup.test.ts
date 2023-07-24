/* eslint-disable jest/no-mocks-import */
import upath from "upath";
import NpmLookup from "../../../src/parsers/helpers/NpmLookup";

it("resolves the source file for the import specifier", () => {
  const npmLookup = new NpmLookup("@yext/search-ui-react", __filename);
  expect(npmLookup.getResolvedFilepath()).toBe(
    upath.resolve(
      __dirname,
      "../../../../../node_modules/@yext/search-ui-react/lib/esm/index.d.ts"
    )
  );
});

it("throws when the import specifier cannot be resolved", () => {
  const instantiate = () => new NpmLookup("@package-that-DNE", __filename);
  expect(instantiate).toThrow(
    `The import specifier "@package-that-DNE" could not be resolved from ${__filename}.`
  );
});

it("can resolve relative filepaths", () => {
  const relativePath = "../../__fixtures__/NpmLookup/sourceFileToLookup";
  const npmLookup = new NpmLookup(relativePath, __filename);
  expect(npmLookup.getResolvedFilepath()).toEqual(
    upath.resolve(__dirname, relativePath + ".ts")
  );
});

it("will not recurse when resolving relative imports", () => {
  const relativePath = "./__fixtures__/NpmLookup/sourceFileToLookup";
  const instantiate = () => new NpmLookup(relativePath, __filename);
  expect(instantiate).toThrow(
    `The import specifier "${relativePath}" could not be resolved from ${__filename}.`
  );
});

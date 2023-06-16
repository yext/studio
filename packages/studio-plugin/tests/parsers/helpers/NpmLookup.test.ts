/* eslint-disable jest/no-mocks-import */
import path from "path";
import NpmLookup from "../../../src/parsers/helpers/NpmLookup";

it("resolves the source file for the import specifier", () => {
  const npmLookup = new NpmLookup("@yext/search-ui-react", __dirname);
  expect(npmLookup.getResolvedFilepath()).toBe(
    path.resolve(
      __dirname,
      "../../../../../node_modules/@yext/search-ui-react/lib/esm/index.d.ts"
    )
  );
});

it("throws when the import specifier cannot be resolved", () => {
  const instantiate = () => new NpmLookup("@package-that-DNE", __dirname);
  expect(instantiate).toThrow(
    'The import specifier "@package-that-DNE" could not be resolved.'
  );
});

it("can resolve relative filepaths", () => {
  const relativePath = "./__fixtures__/NpmLookup/sourceFileToLookup";
  const rootPath = path.resolve(__dirname, "../..");
  const npmLookup = new NpmLookup(relativePath, rootPath);
  expect(npmLookup.getResolvedFilepath()).toEqual(
    path.resolve(rootPath, relativePath + ".ts")
  );
});

it("will not recurse when resolving relative imports", () => {
  const relativePath = "./__fixtures__/NpmLookup/sourceFileToLookup";
  const rootPath = path.resolve(__dirname, "..");
  const instantiate = () => new NpmLookup(relativePath, rootPath);
  expect(instantiate).toThrow(
    `The import specifier "${relativePath}" could not be resolved.`
  );
});

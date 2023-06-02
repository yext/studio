/* eslint-disable jest/no-mocks-import */
import path from "path";
import NpmLookup from "../../../src/parsers/helpers/NpmLookup";

it("gets the absolute path to the package", () => {
  const npmLookup = new NpmLookup("@yext/search-ui-react");
  expect(npmLookup.getRootPath()).toBe(
    path.resolve(
      __dirname,
      "../../../../../node_modules/@yext/search-ui-react"
    ) + "/"
  );
});

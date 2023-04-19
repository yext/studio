/* eslint-disable jest/no-mocks-import */
import path from "path";
import process from "process";
import MockNpmLookup from "../__mocks__/MockNpmLookup";

describe("NpmLookup", () => {
  it("gets the absolute path to the plugin", () => {
    const plugin = new MockNpmLookup("@yext/sample-component");
    expect(plugin.getRootPath()).toBe(
      path.join(process.cwd(), "tests/__fixtures__/PluginConfig/")
    );
  });
});

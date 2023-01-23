import path from "path";
import process from "process";
import MockResolvePlugin from "../__mocks__/MockResolvePlugin";

describe("ResolvePlugin", () => {
  it("gets the absolute path to the plugin", () => {
    const plugin = new MockResolvePlugin("@yext/sample-component");
    expect(plugin.getPathToModule()).toBe(
      path.join(process.cwd(), "tests/__fixtures__/PluginConfig/")
    );
  });
});

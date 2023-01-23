import path from "path";
import process from "process";
import MockResolvePlugin from "../__mocks__/MockResolvePlugin";
import PluginConfig from "../__fixtures__/PluginConfig/SampleComponent";

describe("ResolvePlugin", () => {
  it("gets the absolute path to the plugin", () => {
    const plugin = new MockResolvePlugin("@yext/sample-component");
    expect(plugin.getPathToModule()).toBe(
      path.join(process.cwd(), "tests/__fixtures__/PluginConfig/")
    );
  });

  it("gets the absolute path to the entry file of the plugin", () => {
    const plugin = new MockResolvePlugin("@yext/sample-component");
    expect(plugin.getPathToConfig()).toBe(
      path.join(
        process.cwd(),
        "tests/__fixtures__/PluginConfig/SampleComponent.tsx"
      )
    );
  });

  it("gets the absolute path to a specific component in the plugin", async () => {
    const plugin = new MockResolvePlugin("@yext/sample-component");
    expect(await plugin.getPathToComponent("AceComponent")).toBe(
      path.join(
        process.cwd(),
        "tests/__fixtures__/PluginConfig/src/components/AceComponent.tsx"
      )
    );
  });

  it("gets the config of the plugin", async () => {
    const plugin = new MockResolvePlugin("@yext/sample-component");
    expect(await plugin.getConfig()).toStrictEqual(PluginConfig);
  });
});

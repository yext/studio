import process from "process";
import getPluginPaths from "../../src/parsers/getPluginPaths";
import { PluginDeclaration } from "../../src";

const BASE_PATH = "/Users/username/repos/studio-prototype/packages/studio-plugin/node_modules/@yext/sample-component/src/components/";

const samplePlugin: PluginDeclaration = {
  name: "@yext/sample-component",
  components: [
    "src/components/AceComponent",
    "src/components/BevComponent",
    "src/components/ChazComponent",
  ],
};
const acePath = BASE_PATH + "AceComponent.tsx";
const bevPath = BASE_PATH + "BevComponent.tsx";
const chazPath = BASE_PATH + "ChazComponent.tsx";

describe("getPluginPaths()", () => {
  it("returns an array of paths pointing to each plugin file", async () => {
    const spy = jest.spyOn(process, "cwd");
    spy.mockReturnValue("/Users/username/repos/studio-prototype/packages/studio-plugin");

    const pluginPaths = getPluginPaths([samplePlugin]);

    expect(pluginPaths).toEqual([
      acePath,
      bevPath,
      chazPath,
    ]);
  });
});

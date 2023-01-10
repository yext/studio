import getPluginPaths from "../../src/parsers/getPluginPaths";
import { PluginDeclaration } from "../../src";

const samplePlugin: PluginDeclaration = {
  components: [
    "AceComponent",
    "BevComponent",
    "ChazComponent",
  ]
};

const acePath = "/Users/ttimblin/repo/studio-prototype/packages/sample-component/src/components/AceComponent";
const bevPath = "/Users/ttimblin/repo/studio-prototype/packages/sample-component/src/components/BevComponent";
const chazPath = "/Users/ttimblin/repo/studio-prototype/packages/sample-component/src/components/ChazComponent";

it("returns an array of paths pointing to each plugin file", async () => {
  const pluginPaths = getPluginPaths([samplePlugin]);
  expect(pluginPaths).toEqual([
    acePath,
    bevPath,
    chazPath,
  ]);
});

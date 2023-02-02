import { PluginConfig } from "@yext/studio-plugin";
import packageJson from "../package.json";

export * from "./components";

const pluginConfig: PluginConfig = {
  name: packageJson.name,
  components: {
    ResultsCount: "src/components/ResultsCount.tsx",
    SearchBar: "src/components/SearchBar.tsx",
    UniversalResults: "src/components/UniversalResults.tsx",
  },
};

export default pluginConfig;

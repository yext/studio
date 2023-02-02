import { PluginConfig } from "@yext/studio-plugin";

export * from "./components";

const pluginConfig: PluginConfig = {
  name: "@yext/sample-component",
  components: {
    AceComponent: "src/components/AceComponent.tsx",
    BevComponent: "src/components/BevComponent.tsx",
    ChazComponent: "src/components/ChazComponent.tsx",
  },
};

export default pluginConfig;

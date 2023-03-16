import { PluginConfig } from "../../../src/types";

const config: PluginConfig = {
  name: "@yext/sample-component",
  components: {
    AceComponent: "src/components/AceComponent.tsx",
    BevComponent: "src/components/BevComponent.tsx",
    ChazComponent: "src/components/ChazComponent.tsx",
  },
};

export default config;

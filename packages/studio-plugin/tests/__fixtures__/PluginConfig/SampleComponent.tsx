import { PluginConfig } from "../../../src/index-cjs";

const Config: PluginConfig = {
  name: "@yext/sample-component",
  components: {
    AceComponent: "src/components/AceComponent.tsx",
    BevComponent: "src/components/BevComponent.tsx",
    ChazComponent: "src/components/ChazComponent.tsx",
  },
};

export default Config;

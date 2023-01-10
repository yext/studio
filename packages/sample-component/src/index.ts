import { PluginDeclaration } from "@yext/studio-plugin";

export * from "./components";

export const SamplePluginDeclaration: PluginDeclaration = {
  name: "@yext/sample-component",
  components: [
    "src/components/AceComponent",
    "src/components/BevComponent",
    "src/components/ChazComponent",
  ],
};

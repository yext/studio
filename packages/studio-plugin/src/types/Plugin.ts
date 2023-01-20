export type PluginConfig = {
  name: string;
  components: Record<string, string>;
}

export type PluginRef = {
  filepath: string;
  componentName: string;
  moduleName: string;
};
export type PluginConfig = {
  name: string;
  components: Record<string, string>;
  default: never;
};

export type PluginName = {
  componentName: string;
  moduleName: string;
};

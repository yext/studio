import path from "path";
import { PluginDeclaration } from "../types";

export default function getPluginPaths(pluginDefinitions: PluginDeclaration[]): string[] {
  const paths: string[] = [];

  pluginDefinitions.forEach((plugin: PluginDeclaration) => {
    plugin.components.forEach((component: string) => {
      paths.push(path.join(process.cwd(), "node_modules", plugin.name, component) + ".tsx");
    });
  });

  return paths;
}
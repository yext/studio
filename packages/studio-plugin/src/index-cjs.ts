import { ConfigEnv } from "vite";
import createStudioPluginFactory from "./createStudioPlugin";
import { JsonImporter } from "./types/JsonImporter";

const createStudioPlugin = (args: ConfigEnv) => {
  const jsonImporter: JsonImporter = (filename) =>
    import(/* @vite-ignore */ filename);
  return createStudioPluginFactory(args, jsonImporter);
};

export default createStudioPlugin;
export * from "./types";
export * from "./utils";
export { TEMPLATE_STRING_EXPRESSION_REGEX } from "./constants";

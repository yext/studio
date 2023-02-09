import { ConfigEnv } from "vite";
import createStudioPluginFactory from "./createStudioPlugin";
import { JsonImporter } from "./types/JsonImporter";

const createStudioPlugin = (args: ConfigEnv) => {
  const jsonImporter: JsonImporter = (filename) =>
    import(filename, { assert: { type: "json " } });
  return createStudioPluginFactory(args, jsonImporter);
};

export default createStudioPlugin;
export * from "./types";
export * from "./utils";
export { TEMPLATE_STRING_EXPRESSION_REGEX } from "./constants";

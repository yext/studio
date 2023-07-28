import { Stream } from "@yext/pages";

export const STUDIO_PACKAGE_NAME = "@yext/studio";
export const PAGES_PACKAGE_NAME = "@yext/pages";
export const TEMPLATE_STRING_EXPRESSION_REGEX = /\${(.*?)}/g;
export const TEMPLATE_CONFIG_VARIABLE_NAME = "config";
export const GET_PATH_FUNCTION_NAME = "getPath";
export const PAGESJS_TEMPLATE_PROPS_TYPE = "TemplateProps";
export const STUDIO_PROCESS_ARGS_OBJ = "YEXT_STUDIO_ARGS";
export const STREAM_LOCALIZATION: Stream["localization"] = {
  locales: ["en"],
  primary: false,
};

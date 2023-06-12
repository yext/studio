import { GetPath, TemplateProps } from "@yext/pages";

export const getPath: GetPath<TemplateProps> = () => {
  return "camel";
};

export default function Camelcase() {}

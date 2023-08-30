import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-EntityPage",
    localization: { locales: ["en"] },
    filter: {},
    fields: [],
  },
};
export const getPath: GetPath<TemplateProps> = () => {
  return `entity-page`;
};

export default function EntityPage() {}

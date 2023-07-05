import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id",
    localization: { locales: ["en"], primary: false },
    filter: { entityTypes: ["test1"], savedFilterIds: ["test2", "test3"] },
    fields: [],
  },
};
export const getPath: GetPath<TemplateProps> = () => {
  return `entity-page`;
};

export default function EntityPage() {}

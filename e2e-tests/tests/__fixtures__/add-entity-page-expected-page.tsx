import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-EntityPage",
    localization: { locales: ["en"], primary: false },
    filter: {
      entityTypes: ["entity1"],
      savedFilterIds: ["entity2", "entity3"],
    },
    fields: [],
  },
};
export const getPath: GetPath<TemplateProps> = () => {
  return `entity-page`;
};

export default function EntityPage() {}

import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id",
    localization: { locales: ["en"], primary: false },
    filter: {
      entityIds: ["entityid"],
      entityTypes: ["entitytype"],
      savedFilterIds: ["savedfilterid"],
    },
    fields: ["slug"],
  },
};
export const getPath: GetPath<TemplateProps> = ({ document }) => {
  return `${document.slug}`;
};

export default function Page() {}

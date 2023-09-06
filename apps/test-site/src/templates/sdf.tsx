import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-sdf",
    localization: { locales: ["en"] },
    filter: { entityIds: ["3723515499403010611"] },
    fields: ["slug"],
  },
};
export const getPath: GetPath<TemplateProps> = ({ document }) => {
  return `${document.slug}`;
};

export default function Sdf() {}

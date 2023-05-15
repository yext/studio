import { GetPath, TemplateProps } from "@yext/pages";

export const getPath: GetPath<TemplateProps> = ({
  document,
}: TemplateProps) => {
  return `test-${document.slug}`;
};

export default function IndexPage() {}

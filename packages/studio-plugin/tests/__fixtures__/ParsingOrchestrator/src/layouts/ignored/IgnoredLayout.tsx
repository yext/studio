import { TemplateProps } from "@yext/pages/*";
import Card from "../../components/Card";

export default function IgnoredLayout({ document }: TemplateProps) {
  return <Card text={document.title} />;
}

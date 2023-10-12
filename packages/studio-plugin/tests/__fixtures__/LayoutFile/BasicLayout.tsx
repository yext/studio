import "./index.css";
import ComplexBanner from "../ComponentFile/ComplexBanner";
import { TemplateProps } from "@yext/pages";

export default function BasicLayout({ document }: TemplateProps) {
  return <ComplexBanner title={document.title} num={3} bool={false} />;
}

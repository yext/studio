import "./index.css";
import ComplexBanner from "../ComponentFile/ComplexBanner";
import "@yext/search-ui-react/index.css";
import { TemplateProps } from "@yext/pages";

export default function BasicLayout({ document }: TemplateProps) {
  return <ComplexBanner title={document.title} num={3} bool={false} />;
}

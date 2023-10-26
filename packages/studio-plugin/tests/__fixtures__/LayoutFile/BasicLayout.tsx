import "../styles/index.css";
import "../styles/sassy.scss";
import "@yext/search-ui-react/lib/bundle.css";

import ComplexBanner from "../ComponentFile/ComplexBanner";
import { TemplateProps } from "@yext/pages";

export default function BasicLayout({ document }: TemplateProps) {
  return <ComplexBanner title={document.title} num={3} bool={false} />;
}

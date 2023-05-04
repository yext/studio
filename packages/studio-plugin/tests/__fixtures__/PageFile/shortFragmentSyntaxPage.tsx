import "./index.css";
import ComplexBanner from "../ComponentFile/ComplexBanner";
import "@yext/search-ui-react/index.css";
import { GetPath, TemplateProps } from "@yext/pages";

export const getPath: GetPath<TemplateProps> = () => {
  return "index.html";
};

export default function IndexPage() {
  return (
    <>
      <ComplexBanner title="first!" num={1} />
      <ComplexBanner />
      <ComplexBanner title="three" num={3} bool={false} />
    </>
  );
}

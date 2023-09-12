import { TemplateProps } from "@yext/pages";
import ComplexBanner from "../ComponentFile/ComplexBanner";

export default function Test({ document }: TemplateProps) {
  return (
    <>
      {document.services.map((item, index) => <ComplexBanner key={index} />)}
    </>
  );
}

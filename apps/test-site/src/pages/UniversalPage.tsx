import { TemplateConfig, TemplateProps } from "@yext/pages";
import { AceComponent } from "@yext/sample-component";
import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";
import ContainerWithButtons from "../modules/ContainerWithButtons";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id",
    filter: {},
    localization: { locales: ["en"], primary: false },
    fields: ["services", "address.city"],
  },
};

export default function UniversalPage({ document }: TemplateProps) {
  return (
    <>
      <Banner />
    </>
  );
}

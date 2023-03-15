import { TemplateConfig, TemplateProps } from "@yext/pages";
import { AceComponent } from "@yext/sample-component";
import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";
import ContainerWithButtons from "../modules/ContainerWithButtons";
import siteSettings from "../siteSettings";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id",
    filter: {},
    localization: { locales: ["en"], primary: false },
    fields: ["services"],
  },
};

export default function UniversalPage({ document }: TemplateProps) {
  return (
    <div>
      {document.services.map((item) => (
        <Banner title={`${item}!`} />
      ))}
      <Container>
        <Button bgColor="bg-red-100" />
      </Container>
      <AceComponent text="ace" />
      <ContainerWithButtons bannerTitle={siteSettings.someText} />
      <Banner nestedProp={{ egg: "eggyweggy" }} />
    </div>
  );
}

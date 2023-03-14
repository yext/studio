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
    fields: ["address.city"],
  },
};

export default function UniversalPage({ document }: TemplateProps) {
  return (
    <div>
      <Banner />
      <Container>
        <Button bgColor="bg-red-100" />
      </Container>
      <AceComponent text="ace" />
      <ContainerWithButtons
        bannerTitle={`${document.address.city}`}
        document={document}
      />
      <Banner nestedProp={{ egg: "eggyweggy" }} />
    </div>
  );
}

import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";
import { AceComponent } from "@yext/sample-component";
import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";
import Cta from "../components/Cta";
import ContainerWithButtons from "../modules/ContainerWithButtons";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id",
    filter: {},
    localization: { locales: ["en"], primary: false },
    fields: ["services", "address"],
  },
};
export const getPath: GetPath<TemplateProps> = ({ document }) => {
  return document.slug;
};

export default function UniversalPage({ document }: TemplateProps) {
  return (
    <>
      <Cta label="[LABEL]" link="[URL]" linkType="[LINK TYPE]" />
      {document.services.map((item, index) => (
        <Banner title={`${item}!`} key={index} />
      ))}
      <Container>
        <Button />
      </Container>
      <AceComponent text="ace" />
      <ContainerWithButtons
        bannerTitle={document.address.city}
        document={document}
      />
      <Banner nestedProp={{ egg: "eggyweggy" }} title="" />
    </>
  );
}

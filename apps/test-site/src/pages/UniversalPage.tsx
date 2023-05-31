import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";
import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";
import Cta from "../components/Cta";
import ContainerWithButtons from "../modules/ContainerWithButtons";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id",
    localization: { locales: ["en"], primary: false },
    filter: {},
    fields: ["services", "address", "slug"],
  },
};
export const getPath: GetPath<TemplateProps> = ({
  document,
}: TemplateProps) => {
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
      <ContainerWithButtons
        bannerTitle={document.address.city}
        document={document}
      />
      <Banner
        obj={{
          nestedString: `hello ${document.address.city}  ${document.id}`,
          nestedObj: { nestedNum: 333, nestedColor: "#FFFFFF" },
          nestedBool: false,
        }}
        title=""
        bgColor="#FFFFFF"
        bool={false}
        num={0}
      />
    </>
  );
}

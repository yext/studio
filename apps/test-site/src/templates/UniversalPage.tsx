import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";
import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";
import Cta from "../components/Cta";
import FixedText from "../components/FixedText";
import "../styles/main.css";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-UniversalPage",
    localization: { locales: ["en"] },
    filter: { entityTypes: ["location"] },
    fields: ["services", "address", "hours", "slug"],
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
      <FixedText />
      <Cta label="[LABEL]" link="[URL]" linkType="[LINK TYPE]" />
      <Container>
        <Button />
      </Container>
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
        intervals={[
          { start: "01:00", end: document.hours.monday.openIntervals[0].end },
        ]}
      />
    </>
  );
}

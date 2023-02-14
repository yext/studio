import { AceComponent } from "@yext/sample-component";
import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";
import ContainerWithButtons from "../modules/ContainerWithButtons";
import siteSettings from "../siteSettings";

export default function UniversalPage() {
  return (
    <div>
      <Banner />
      <Container>
        <Button bgColor="bg-red-100" />
      </Container>
      <AceComponent text="ace" />
      <ContainerWithButtons bannerNum={siteSettings.someNum} />
      <Banner nestedProp={{ egg: "eggyweggy" }} />
    </div>
  );
}

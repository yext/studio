import { AceComponent } from "@yext/sample-component";
import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";
import ContainerWithButtons from "../modules/ContainerWithButtons";
import siteSettings from "../siteSettings";

export default function UniversalPage() {
  return (
    <>
      <Button />
      <Button />
      <>
        <Button />
        <Banner bgColor="#abcdef" num={5} bool={true} title="initial title" />
        <Banner bgColor="#abcdef" num={5} bool={true} title="initial title" />
        <Banner bgColor="#abcdef" num={5} bool={true} title="initial title" />
        <Banner bgColor="#abcdef" num={5} bool={true} title="initial title" />
        <Banner bgColor="#abcdef" num={5} bool={true} title="initial title" />
        <Banner bgColor="#abcdef" num={5} bool={true} title="initial title" />
        <Banner bgColor="#abcdef" num={5} bool={true} title="initial title" />
        <Banner bgColor="#abcdef" num={5} bool={true} title="initial title" />
        <Banner bgColor="#abcdef" num={5} bool={true} title="initial title" />
        <div>
          <Container>
            <Button bgColor="bg-red-100" />
          </Container>
          <Banner />
          <AceComponent text="ace" />
          <ContainerWithButtons bannerTitle={siteSettings.someText} />
          <Banner nestedProp={{ egg: "eggyweggy" }} />
        </div>
      </>
    </>
  );
}

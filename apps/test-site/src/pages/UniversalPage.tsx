import { AceComponent } from "@yext/sample-component";
import Banner from "../components/Banner";
import Container from "../components/Container";
import ContainerWithButtons from "../modules/ContainerWithButtons";

export default function UniversalPage() {
  return (
    <>
      <div>
        <Banner />
        <Container />
        <ContainerWithButtons />
        <Banner
          nestedProp={{ egg: "eggyweggy" }}
          bgColor="#FFFFFF"
          bool={false}
          num={0}
          title=""
        />
      </div>
      <AceComponent text="ace" />
      <AceComponent text="ace" />
    </>
  );
}

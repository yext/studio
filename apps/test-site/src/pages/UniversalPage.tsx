import { AceComponent } from "@yext/sample-component";
import Banner from "../components/Banner";
import Container from "../components/Container";
import ContainerWithButtons from "../modules/ContainerWithButtons";

export default function UniversalPage() {
  return (
    <div>
      <Banner />
      <Container />
      <AceComponent text="ace" />
      <ContainerWithButtons />
      <Banner nestedProp={{ egg: "eggyweggy" }} />
    </div>
  );
}

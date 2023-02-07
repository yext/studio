import { AceComponent } from "@yext/sample-component";
import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";
import ContainerWithButtons from "../modules/ContainerWithButtons";

export default function UniversalPage() {
  return (
    <div>
      <Banner />
      <Container>
        <Button />
      </Container>
      <ContainerWithButtons />
      <Banner nestedProp={{ egg: "eggyweggy" }} />
    </div>
  );
}

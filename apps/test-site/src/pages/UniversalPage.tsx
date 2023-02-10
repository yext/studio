import { AceComponent } from "@yext/sample-component";
import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";
import ContainerWithButtons from "../modules/ContainerWithButtons";

export default function UniversalPage() {
  return (
    <div>
      <Banner bgColor="#FFFFFF" bool={false} num={0} title="" />
      <Container className="asdf">
        <Button bgColor="bg-blue-100" />
      </Container>
      <AceComponent text="ace" />
      <ContainerWithButtons />
      <Banner nestedProp={{ egg: "eggyweggy" }} />
    </div>
  );
}

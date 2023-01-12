import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";
import ContainerWithButtons from "../modules/ContainerWithButtons";
import AceComponent from "@yext/sample-component/src/components/AceComponent";

export default function UniversalPage() {
  return (
    <div>
      <Banner />
      <Container>
        <Button />
        <AceComponent text="there" />
      </Container>
      <ContainerWithButtons />
      <Banner nestedProp={{ egg: "eggyweggy" }} />
    </div>
  );
}

import Banner from "../components/Banner";
import Container from "../components/Container";
import ContainerWithButtons from "../modules/ContainerWithButtons";

export default function UniversalPage() {
  return (
    <div>
      <Banner />
      <Container />
      <ContainerWithButtons />
      <Banner nestedProp={{ egg: "eggyweggy" }} />
    </div>
  );
}

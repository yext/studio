import Banner from "../components/Banner";
import Container from "../components/Container";

export default function ContainerWithButtons() {
  return (
    <Container>
      <Container>
        <Banner
          bgColor="#2b4a69"
          num={53}
          bool={false}
          title="initial title33"
        />
      </Container>
    </Container>
  );
}

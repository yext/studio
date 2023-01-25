import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";

export default function ContainerWithButtons() {
  return (
    <Container>
      <Button />
      <Button />
      <Banner bgColor="#FFFFFF" bool={false} num={0} title="asdfasdffd" />
      <Container>
        <Banner bgColor="#abcdef" num={5} bool={true} title="initial title" />
      </Container>
    </Container>
  );
}

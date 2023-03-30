import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";

export default function UniversalPage() {
  return (
    <>
      <Button id="foo" />
      <Button id="bar" />
      <div>
        <Container>
          <Banner />
        </Container>
      </div>
    </>
  );
}

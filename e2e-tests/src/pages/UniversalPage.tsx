import Banner from "../components/Banner";
import Container from "../components/Container";

export default function UniversalPage() {
  return (
    <>
      <Container />
      <div>
        <Container>
          <Banner />
        </Container>
      </div>
    </>
  );
}

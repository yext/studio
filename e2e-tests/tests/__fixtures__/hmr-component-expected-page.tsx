import Banner from "../components/Banner";
import Container from "../components/Container";

export default function UniversalPage() {
  return (
    <>
      <Banner num={1} bool={false} />
      <Banner bgColor="#abcdef" num={5} bool={true} title="initial title" />
      <div>
        <Container>
          <Banner />
        </Container>
      </div>
    </>
  );
}

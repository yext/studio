import Container from "../components/Container";
import Test from "../modules/Test";

export default function UniversalPage() {
  return (
    <>
      <Container className={``}>
        <Container>
          <Container className={``}>
            <Container className={``}>
              <Test />
            </Container>
          </Container>
        </Container>
      </Container>
    </>
  );
}

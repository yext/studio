import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";

export default function UniversalPage() {
  return (
    <>
      <Button className="px-2" />
      <Button className="px-4" />
      <div>
        <Container>
          <Banner />
        </Container>
      </div>
    </>
  );
}

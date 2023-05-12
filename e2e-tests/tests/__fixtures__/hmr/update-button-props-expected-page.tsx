import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";

export default function BasicPage() {
  return (
    <>
      <Button className="px-4 py-2 text-lg border-4 border-green-500" />
      <Button className="px-4" />
      <div>
        <Container>
          <Banner />
        </Container>
      </div>
    </>
  );
}

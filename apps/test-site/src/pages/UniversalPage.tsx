import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";

export default function UniversalPage() {
  return (
    <div>
      <Banner />
      <Container>
        <Button />
      </Container>
      <Banner nestedProp={{ egg: "!!!" }} />
    </div>
  );
}

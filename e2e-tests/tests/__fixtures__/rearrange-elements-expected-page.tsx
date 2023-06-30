import Banner from "../components/Banner";
import Container from "../components/Container";

export default function BasicPage() {
  return (
    <>
      <Banner bool={false} num={0} />
      <div>
        <Container />
      </div>
    </>
  );
}

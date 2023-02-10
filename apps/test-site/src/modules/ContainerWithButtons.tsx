import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";

export interface ContainerWithButtonsProps {
  bannerNum?: number;
}

export default function ContainerWithButtons(props: ContainerWithButtonsProps) {
  return (
    <Container>
      <Button />
      <Button />
      <Banner
        bgColor="#FFFFFF"
        bool={false}
        num={props.bannerNum}
        title="asdfasdffd"
      />
      <Container>
        <Banner bgColor="#abcdef" num={5} bool={true} title="initial title" />
      </Container>
    </Container>
  );
}

import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";

export interface ContainerWithButtonsProps {
  bannerTitle?: string;
  document: Record<string, any>;
}

export default function ContainerWithButtons({
  document,
  ...props
}: ContainerWithButtonsProps) {
  return (
    <Container>
      <Button />
      <Button />
      <Banner
        bgColor="#FFFFFF"
        bool={false}
        num={12}
        title={`${props.bannerTitle} ${document.address.city}`}
      />
      <Container>
        <Banner bgColor="#abcdef" num={5} bool={true} title="initial title" />
      </Container>
    </Container>
  );
}

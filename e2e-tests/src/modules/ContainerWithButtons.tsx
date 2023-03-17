import Button from "../components/Button";
import Container from "../components/Container";

export interface ContainerWithButtonsProps {
  document: Record<string, any>;
}

export default function ContainerWithButtons(
  _props: ContainerWithButtonsProps
) {
  return (
    <Container>
      <Button />
      <Button />
    </Container>
  );
}

import Button from "../components/Button";
import Container from '../components/Container';
import ContainerWithButtons from '../modules/ContainerWithButtons';

export default function UniversalPage() {
  return (
    <div>
      <Button />
      <Container>
        <Button/>
      </Container>
      <ContainerWithButtons/>
    </div>
  );
}

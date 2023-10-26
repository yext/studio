import { GetPath, TemplateProps } from "@yext/pages";
import Banner from "../components/Banner";
import Container from "../components/Container";
import "../styles/main.css";

export const getPath: GetPath<TemplateProps> = () => {
  return "index.html";
};

export default function BasicPage() {
  return (
    <div>
      <Container>
        <Banner bool={false} num={0} />
      </Container>
    </div>
  );
}

import { GetPath, TemplateProps } from "@yext/pages";
import Banner from "../components/Banner";
import Container from "../components/Container";
import Footer from "../components/Footer";

export const getPath: GetPath<TemplateProps> = () => {
  return "index.html";
};

export default function BasicPage() {
  return (
    <>
      <Container>
        <Banner bool={false} num={0} />
      </Container>
      <Footer copyrightText="© 2023 Yext" backgroundColor="#BAD8FD" />
      <div />
    </>
  );
}

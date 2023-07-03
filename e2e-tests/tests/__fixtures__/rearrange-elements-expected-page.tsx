import { GetPath, TemplateProps } from "@yext/pages";
import Banner from "../components/Banner";
import Container from "../components/Container";

export const getPath: GetPath<TemplateProps> = () => {
  return "index.html";
};

export default function BasicPage() {
  return (
    <>
      <Banner />
      <div>
        <Container />
      </div>
    </>
  );
}

import { GetPath, TemplateProps } from "@yext/pages";
import Header from "../components/Header";
import "../styles/main.css";

export const getPath: GetPath<TemplateProps> = () => {
  return "index.html";
};

export default function LayoutPage() {
  return (
    <Header
      title="Yext"
      logo="https://a.mktgcdn.com/p/R9FjcYjRNA5dAespqgHFLMvu2m18-E5Apnb3KON0oJY/300x300.png"
      backgroundColor="#BAD8FD"
    />
  );
}

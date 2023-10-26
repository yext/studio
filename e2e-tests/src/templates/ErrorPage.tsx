import { GetPath, TemplateProps } from "@yext/pages";
import "../styles/main.css";

export const getPath: GetPath<TemplateProps> = () => {
  return "error-page";
};

export default function ErrorPage() {
  return null;
}

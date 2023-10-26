import { GetPath, TemplateProps } from "@yext/pages";
import ErrorComponent from "../components/ErrorComponent";
import "../styles/main.css";

export const getPath: GetPath<TemplateProps> = () => {
  return "error-component-page";
};

export default function ErrorComponentPreviews() {
  return (
    <>
      <ErrorComponent />
      <ErrorComponent />
    </>
  );
}

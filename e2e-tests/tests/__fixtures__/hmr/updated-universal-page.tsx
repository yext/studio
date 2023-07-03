import { GetPath, TemplateProps } from "@yext/pages";
import Button from "../components/Button";

export const getPath: GetPath<TemplateProps> = () => {
  return "index.html";
};

export default function BasicPage() {
  return (
    <>
      <Button />
      <Button />
    </>
  );
}

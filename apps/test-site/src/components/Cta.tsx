import { CtaData } from "@yext/search-ui-react";

export const initialProps: CtaData = {
  label: "[LABEL]",
  link: "[URL]",
  linkType: "[LINK TYPE]",
};

export default function Cta(props: CtaData) {
  return (
    <a href={props.link} className="text-md border-2 border-blue-500">
      {props.linkType}: {props.label}
    </a>
  );
}

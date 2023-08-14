import { HexColor } from "@yext/studio";

export interface FooterProps {
  copywrightText?: string;
  backgroundColor?: HexColor;
}

export const initialProps: FooterProps = {
  copywrightText: "© 2023 Yext",
  backgroundColor: "#BAD8FD"
};

export default function Footer({ copywrightText, backgroundColor }: FooterProps) {
  return (
    <footer style={{backgroundColor}}>
      {copywrightText && <p>{copywrightText}</p>}
    </footer>
  );
}

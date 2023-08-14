import { HexColor } from "@yext/studio";

export interface FooterProps {
  copyrightText?: string;
  backgroundColor?: HexColor;
}

export const initialProps: FooterProps = {
  copyrightText: "© 2023 Yext",
  backgroundColor: "#BAD8FD",
};

export default function Footer({
  copyrightText,
  backgroundColor,
}: FooterProps) {
  return (
    <footer style={{ backgroundColor }}>
      {copyrightText && <p>{copyrightText}</p>}
    </footer>
  );
}

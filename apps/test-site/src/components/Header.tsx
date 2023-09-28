import { HexColor } from "@yext/studio";
import "../main.css";

export interface HeaderProps {
  /** Title of the Header */
  title: string;
  logo?: string;
  backgroundColor?: HexColor;
}

export const initialProps: HeaderProps = {
  title: "Yext",
  logo: "https://a.mktgcdn.com/p/R9FjcYjRNA5dAespqgHFLMvu2m18-E5Apnb3KON0oJY/300x300.png",
  backgroundColor: "#BAD8FD",
};

export default function Header({ title, logo, backgroundColor }: HeaderProps) {
  return (
    <div
      className="flex h-20 justify-between items-center"
      style={{ backgroundColor }}
    >
      <div className="text-2xl pl-1">{title}</div>
      {logo && (
        <img
          className="h-14 w-auto rounded-md lg:block pr-1"
          src={logo}
          alt="Your Company"
        />
      )}
    </div>
  );
}

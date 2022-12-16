import { ReactNode } from "react";

export interface NestedBannerProps {
  text: string;
  children: ReactNode;
}

export default function NestedBanner(props: NestedBannerProps) {
  return (
    <div>
      Nest me: {props.text} {props.children}
    </div>
  );
}

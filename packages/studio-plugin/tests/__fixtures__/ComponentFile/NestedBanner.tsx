import { ReactNode } from "react";

export interface NestedBannerProps {
  children: ReactNode;
}

export default function NestedBanner(props: NestedBannerProps) {
  return <div>Nest me: {props.children}</div>;
}

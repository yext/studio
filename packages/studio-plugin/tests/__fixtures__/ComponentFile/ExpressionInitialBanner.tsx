import { INITIAL_TITLE } from "some-constants-file.ts";

export interface ExpressionInitialBannerProps {
  title?: string;
}

export const initialProps: ExpressionInitialBannerProps = {
  title: INITIAL_TITLE,
};

export default function ExpressionInitialBanner(
  props: ExpressionInitialBannerProps
) {
  return <div>{props.title}</div>;
}

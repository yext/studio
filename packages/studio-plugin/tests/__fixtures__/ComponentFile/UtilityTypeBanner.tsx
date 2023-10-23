export interface UtilityTypeBannerProps {
  title?: string;
  missing: number;
}

export default function UtilityTypeBanner(
  props: Omit<UtilityTypeBannerProps, "missing">
) {
  return <div>{props.title}</div>;
}

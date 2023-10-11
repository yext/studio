import ComplexBanner from "./ComplexBanner";

export interface TransitiveCssComponentProps {
  title?: string;
}

export default function TransitiveCssComponent(
  props: TransitiveCssComponentProps
) {
  return (
    <div>
      {props.title}
      <ComplexBanner />
    </div>
  );
}

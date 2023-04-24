import ComplexBanner from "../../ComponentFile/ComplexBanner";

export interface EmptyModuleProps {
  document: Record<string, any>;
  parentNum?: number;
}

export default function Panel({ document, ...props }: EmptyModuleProps) {
  return (
    <ComplexBanner
      title={`title - ${document.anything}`}
      num={props.parentNum}
    />
  );
}

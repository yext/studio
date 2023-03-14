import ComplexBanner from "../../ComponentFile/ComplexBanner";

export interface PanelProps {
  document: Record<string, any>;
  parentNum?: number;
}

export default function Panel({ document, ...props }: PanelProps) {
  return (
    <ComplexBanner
      title={`title - ${document.anything}`}
      num={props.parentNum}
    />
  );
}

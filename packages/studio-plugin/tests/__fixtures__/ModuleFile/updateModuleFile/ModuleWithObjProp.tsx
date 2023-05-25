import ComplexBanner from "../../ComponentFile/ComplexBanner";

export interface PanelProps {
  obj?: { str?: string; num?: number };
}

export default function Panel() {
  return <ComplexBanner />;
}

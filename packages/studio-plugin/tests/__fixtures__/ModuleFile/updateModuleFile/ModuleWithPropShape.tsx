import ComplexBanner from "../../ComponentFile/ComplexBanner";

export interface PanelProps {
  /** title for complex banner */
  complexBannerText?: string;
}

export default function Panel(props: PanelProps) {
  return <ComplexBanner />;
}

import ComplexBanner from "../../ComponentFile/ComplexBanner";

export interface PanelProps {
  /** @tooltip title for complex banner */
  complexBannerText?: string;
}

export default function Panel() {
  return <ComplexBanner />;
}

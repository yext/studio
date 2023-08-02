import ComplexBanner from "../../ComponentFile/ComplexBanner";

export interface PanelProps {
  /** @Tooltip some banner title! */
  complexBannerText?: string;
  /** @Tooltip some boolean to toggle */
  complexBannerBool?: boolean;
}

export default function Panel() {
  return <ComplexBanner />;
}

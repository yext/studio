import ComplexBanner from "../../ComponentFile/ComplexBanner";

export interface PanelProps {
  /** some banner title! */
  complexBannerText?: string;
  /** some boolean to toggle */
  complexBannerBool?: boolean;
}

export default function Panel({
  complexBannerText,
  complexBannerBool,
}: PanelProps) {
  return <ComplexBanner />;
}

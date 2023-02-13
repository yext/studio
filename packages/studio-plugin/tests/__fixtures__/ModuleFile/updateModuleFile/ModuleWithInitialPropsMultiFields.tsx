import ComplexBanner from "../../ComponentFile/ComplexBanner";

export interface PanelProps {
  /** some banner title! */
  complexBannerText?: string;
  /** some boolean to toggle */
  complexBannerBool?: boolean;
}

export const initialProps: PanelProps = {
  complexBannerText: "Welcome!",
  complexBannerBool: true,
};

export default function Panel(props: PanelProps) {
  return <ComplexBanner />;
}

import ComplexBanner from "../../ComponentFile/ComplexBanner";

export interface PanelProps {
  /**
   * @Tooltip some banner title!
   * @DisplayName Title!
   */
  complexBannerText?: string;
  /** @Tooltip some boolean to toggle */
  complexBannerBool?: boolean;
}

export const initialProps: PanelProps = {
  complexBannerText: "Welcome!",
  complexBannerBool: true,
};

export default function Panel() {
  return <ComplexBanner />;
}

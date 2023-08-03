import ComplexBanner from "../../ComponentFile/ComplexBanner";

export interface PanelProps {
  /**
   * @tooltip some banner title!
   * @displayName Title!
   */
  complexBannerText?: string;
  /** @tooltip some boolean to toggle */
  complexBannerBool?: boolean;
}

export const initialProps: PanelProps = {
  complexBannerText: "Welcome!",
  complexBannerBool: true,
};

export default function Panel() {
  return <ComplexBanner />;
}

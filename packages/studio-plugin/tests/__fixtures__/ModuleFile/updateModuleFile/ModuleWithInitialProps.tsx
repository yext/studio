import ComplexBanner from "../../ComponentFile/ComplexBanner";

export interface PanelProps {
  /** @tooltip title for complex banner */
  complexBannerText?: string;
}

export const initialProps: PanelProps = {
  complexBannerText: "Hello world!",
};

export default function Panel() {
  return <ComplexBanner />;
}

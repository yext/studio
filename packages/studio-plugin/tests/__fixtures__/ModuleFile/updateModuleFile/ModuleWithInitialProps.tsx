import ComplexBanner from "../../ComponentFile/ComplexBanner";

export interface PanelProps {
  /** title for complex banner */
  complexBannerText?: string;
}

export const initialProps: PanelProps = { complexBannerText: "Hello world!" };

export default function Panel({ complexBannerText }: PanelProps) {
  return <ComplexBanner />;
}

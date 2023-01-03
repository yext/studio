import NestedBanner from "../components/NestedBanner";
import Card from "../components/Card";

interface BannerWithCardProps {
  bannerText: string;
}

export const initialProps: BannerWithCardProps = {
  bannerText: "top level text",
};

export default function BannerWithCard({ bannerText }: BannerWithCardProps) {
  return (
    <NestedBanner text={bannerText}>
      <Card text="internal card" />
    </NestedBanner>
  );
}

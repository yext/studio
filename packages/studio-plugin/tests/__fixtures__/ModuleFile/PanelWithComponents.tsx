import Banner from "../components/Banner";
import Card from "../components/Card";

interface PanelWithComponentsProps {
  topLevelCardText?: string;
}

export const initialProps: PanelWithComponentsProps = {
  topLevelCardText: "top level card",
};

export default function PanelWithComponents({
  topLevelCardText,
}: PanelWithComponentsProps) {
  return (
    <Card text={topLevelCardText}>
      <Banner />
      <Card text="internal card" />
    </Card>
  );
}

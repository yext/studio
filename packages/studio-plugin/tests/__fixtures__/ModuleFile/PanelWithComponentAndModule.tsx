import Tile from "../modules/Tile";
import Card from "../components/Card";

interface PanelWithComponentAndModuleProps {
  cardText?: string;
}

export default function PanelWithComponentAndModule({
  cardText,
}: PanelWithComponentAndModuleProps) {
  return (
    <>
      <Card text={cardText} />
      <Tile label="tile label" />
    </>
  );
}

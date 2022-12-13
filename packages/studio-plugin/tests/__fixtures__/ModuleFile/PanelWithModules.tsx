import Tile from "../modules/Tile";

interface PanelWithModulesProps {
  topTileLabel?: string;
}

export default function PanelWithModules({
  topTileLabel,
}: PanelWithModulesProps) {
  return (
    <>
      <Tile label={topTileLabel} />
      <Tile label="bottom tile label" />
    </>
  );
}

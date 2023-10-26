import { useCallback } from "react";
import { VIEWPORTS, Viewport } from "./defaults";
import useStudioStore from "../../store/useStudioStore";
import classNames from "classnames";

export interface ViewportMenuProps {
  closeMenu: () => void;
}

export default function ViewportMenu({
  closeMenu,
}: ViewportMenuProps): JSX.Element {
  const [setViewport, currentViewport] = useStudioStore((store) => [
    store.pagePreview.setViewport,
    store.pagePreview.viewport,
  ]);

  const handleSelect = useCallback(
    (viewport: Viewport) => {
      setViewport(viewport);
      closeMenu();
    },
    [closeMenu, setViewport]
  );

  return (
    <div
      className="absolute z-20 rounded bg-white text-sm text-gray-700 shadow-lg flex flex-col items-start py-1"
      data-testid="viewport-selection"
    >
      {Object.values(VIEWPORTS).map((viewport) => {
        return (
          <Option
            key={viewport.name}
            viewport={viewport}
            handleSelect={handleSelect}
            isCurrentlySelected={
              viewport.name !== VIEWPORTS.resetviewport.name &&
              viewport === currentViewport
            }
          />
        );
      })}
    </div>
  );
}
interface OptionProps {
  viewport: Viewport;
  isCurrentlySelected: boolean;
  handleSelect: (viewport: Viewport) => void;
}

function Option({ viewport, isCurrentlySelected, handleSelect }: OptionProps) {
  const onClick = useCallback(
    () => handleSelect(viewport),
    [handleSelect, viewport]
  );
  const { name, styles } = viewport;
  const className = classNames("flex items-center gap-x-2 px-6 py-2 w-full", {
    "bg-gray-300": isCurrentlySelected,
    "hover:bg-gray-100": !isCurrentlySelected,
  });

  return (
    <button
      className={className}
      onClick={onClick}
      aria-label={`Select ${name} Viewport`}
      disabled={isCurrentlySelected}
    >
      <div className="flex flex-row gap-x-2 items-center">
        {name}
        <div className="opacity-75">
          {styles && styles.width + "x" + styles.height}
        </div>
      </div>
    </button>
  );
}

import { useCallback } from "react";
import { VIEWPORTS, Viewport } from "./defaults";
import useStudioStore from "../../store/useStudioStore";

export interface ViewportMenuProps {
  closeMenu: () => void;
}

export default function ViewportMenu({
  closeMenu,
}: ViewportMenuProps): JSX.Element {
  const [setViewport] = useStudioStore((store) => [
    store.pagePreview.setViewport,
  ]);

  const handleSelect = useCallback(
    (viewport: Viewport) => {
      setViewport(viewport);
      closeMenu();
    },
    [closeMenu, setViewport]
  );

  return (
    <div className="absolute z-20 rounded bg-white text-sm text-gray-700 shadow-lg flex flex-col items-start py-1">
      {Object.values(VIEWPORTS).map((val) => {
        return (
          <Option key={val.name} viewport={val} handleSelect={handleSelect} />
        );
      })}
    </div>
  );
}
interface OptionProps {
  viewport: Viewport;
  handleSelect: (viewport) => void;
}

function Option({ viewport, handleSelect }: OptionProps) {
  const onClick = useCallback(
    () => handleSelect(viewport),
    [handleSelect, viewport]
  );
  const { name, styles } = viewport;

  return (
    <button
      className="flex items-center gap-x-2 px-6 py-2 cursor-pointer hover:bg-gray-100 w-full text-left"
      onClick={onClick}
      aria-label={`Select ${name} Viewport`}
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

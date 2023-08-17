import { useCallback } from "react";
import { VIEWPORTS, Viewport } from "./defaults";
import useStudioStore from "../../store/useStudioStore";

interface OptionProps extends Viewport {
  closeMenu: () => void;
}

export default function ViewportMenu(props: {
  closeMenu: () => void;
}): JSX.Element {
  return (
    <div className="absolute z-20 rounded bg-white text-sm text-gray-700 shadow-lg flex flex-col items-start py-1">
      {Object.values(VIEWPORTS).map((val) => {
        return <Option key={val.name} closeMenu={props.closeMenu} {...val} />;
      })}
    </div>
  );
}

function Option({ name, closeMenu, styles }: OptionProps) {
  const [setViewportDimensions] = useStudioStore((store) => [
    store.pagePreview.setViewportDimensions,
  ]);
  const viewportOption = name;

  const handleSelect = useCallback(() => {
    closeMenu();
    setViewportDimensions({
      name: name,
      height: styles?.height ?? window.innerHeight,
      width: styles?.width ?? window.innerWidth,
    });
  }, [closeMenu, name, setViewportDimensions, styles]);

  return (
    <button
      className="flex items-center gap-x-2 px-6 py-2 cursor-pointer hover:bg-gray-100 w-full text-left"
      onClick={handleSelect}
      aria-label={`Select ${viewportOption} Viewport`}
    >
      <div className="flex flex-row gap-x-2 items-center">
        {viewportOption}
        <div className="opacity-75">
          {styles && styles.width + "x" + styles.height}
        </div>
      </div>
    </button>
  );
}

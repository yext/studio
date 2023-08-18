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
  const [setViewport] = useStudioStore((store) => [
    store.pagePreview.setViewport,
  ]);
  const viewportOption = name;

  const handleSelect = useCallback(() => {
    closeMenu();
    const viewport = VIEWPORTS[name.replace(/\s+/g, "").toLowerCase()] ?? VIEWPORTS["resetviewport"];
    setViewport(viewport);
  }, [closeMenu, name, setViewport]);

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

import { useCallback } from "react";
import { EXPANDED_VIEWPORTS, Viewport } from "./defaults";
import useStudioStore from "../../store/useStudioStore";

interface OptionProps extends Viewport {
  closeMenu: () => void;
}

export default function ViewportMenu(props: {
  closeMenu: () => void;
}): JSX.Element {
  return (
    <div className="absolute z-20 rounded bg-white text-sm text-gray-700 shadow-lg flex flex-col items-start py-1">
      {Object.values(EXPANDED_VIEWPORTS).map((val) => {
        return <Option key={val.name} closeMenu={props.closeMenu} {...val} />;
      })}
    </div>
  );
}

function Option(props: OptionProps) {
  const [setViewportDimensions] = useStudioStore((store) => [
    store.pagePreview.setViewportDimensions,
  ]);
  const { closeMenu } = props;
  const viewportOption = props.name;

  const handleSelect = useCallback(() => {
    closeMenu();
    setViewportDimensions({
      name: props.name ?? "Reset Viewport",
      height: props.styles?.height ?? window.innerHeight,
      width: props.styles?.width ?? window.innerWidth,
    });
  }, [closeMenu, setViewportDimensions, props]);

  return (
    <button
      className="flex items-center gap-x-2 px-6 py-2 cursor-pointer hover:bg-gray-100 disabled:opacity-25 w-full text-left"
      onClick={handleSelect}
      aria-label={`Add ${viewportOption} Element`}
    >
      <div className="flex flex-row gap-x-2 items-center">
        {viewportOption}
        <div className="opacity-75">
          {props.styles && props.styles.width + "x" + props.styles.height}
        </div>
      </div>
    </button>
  );
}

import { useCallback, SetStateAction, Dispatch } from "react";
import { EXPANDED_VIEWPORTS, Viewport, ViewportStyles } from "./defaults";

interface optionProps extends Viewport {
  setViewportDimensions: Dispatch<SetStateAction<ViewportStyles>>;
  afterSelect: () => void;
}

export default function ViewportMenu(props: {
  setViewportDimensions: Dispatch<SetStateAction<ViewportStyles>>;
  closeMenu: () => void;
}): JSX.Element {
  const { setViewportDimensions, closeMenu } = props;

  return (
    <div className="absolute z-20 rounded bg-white text-sm text-gray-700 shadow-lg">
      <Selector
        setViewportDimensions={setViewportDimensions}
        afterSelect={closeMenu}
      />
    </div>
  );
}

function Selector(props: {
  afterSelect: () => void;
  setViewportDimensions: Dispatch<SetStateAction<ViewportStyles>>;
}) {
  const { afterSelect, setViewportDimensions } = props;

  return (
    <div className="flex flex-col items-start py-1">
      {Object.values(EXPANDED_VIEWPORTS).map((val) => {
        return (
          <Option
            setViewportDimensions={setViewportDimensions}
            afterSelect={afterSelect}
            {...val}
          />
        );
      })}
    </div>
  );
}

function Option(props: optionProps) {
  const { afterSelect, setViewportDimensions } = props;
  const viewportOption = props.name;

  const handleSelect = useCallback(() => {
    afterSelect?.();
    setViewportDimensions({
      name: props.name ?? "Reset Viewport",
      height: props.styles?.height ?? window.innerHeight,
      width: props.styles?.width ?? window.innerWidth,
    });
  }, [afterSelect, setViewportDimensions, props]);

  return (
    <button
      className="flex items-center gap-x-2 px-6 py-2 cursor-pointer hover:bg-gray-100 disabled:opacity-25 w-full text-left"
      onClick={handleSelect}
      aria-label={`Add ${viewportOption} Element`}
    >
      <div className="flex flex-row gap-x-2 items-center">
        {viewportOption}
        <div className="opacity-75">
          {props.styles ? (
            props.styles.width + "x" + props.styles.height
          ) : (
            <></>
          )}
        </div>
      </div>
    </button>
  );
}

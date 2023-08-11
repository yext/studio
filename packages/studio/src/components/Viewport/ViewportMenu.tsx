import { useState, useCallback } from "react";
import { MINIMAL_VIEWPORTS, Viewport } from "./defaults";
// can switch to other viewports in defaults.tsx

interface optionProps extends Viewport{
    afterSelect: () => void;
}

export default function ViewportMenu({
    closeMenu,
  }: {
    closeMenu: () => void;
  }): JSX.Element {
    const [activeViewport, setActiveViewport] = useState(); // todo

    return (    
        <div className="absolute z-20 rounded bg-white text-sm text-gray-700 shadow-lg">
            <Selector afterSelect={closeMenu}/>
        </div>
    );
}

function Selector(props: {afterSelect: () => void}) {
    const { afterSelect } = props;
    
    return (
        <div className="flex flex-col items-start py-1">
            {Object.values(MINIMAL_VIEWPORTS).map(val => {
                return (<Option afterSelect={afterSelect} {...val} />);
            })}
        </div>
  );
}

function Option(props: optionProps) {
    const { afterSelect } = props;
    const viewportOption = props.name;
   
    const handleSelect = useCallback(() => {
        afterSelect?.();
        // switch viewport
    }, [afterSelect]);
  
    const isSameAsActiveViewport = false; // todo 
  
    return (
      <button
        className="flex items-center gap-x-2 px-6 py-2 cursor-pointer hover:bg-gray-100 disabled:opacity-25 w-full text-left"
        onClick={handleSelect}
        aria-label={`Add ${viewportOption} Element`}
        disabled={isSameAsActiveViewport}
      >
        <div className="flex flex-row gap-x-2 items-center">
            {viewportOption}
            <div className="opacity-75"> 
                {props.styles?.width.replace('px', 'x')} 
                {props.styles?.height.replace('px', '')} 
            </div>
        </div>

      </button>
    );
  }
  
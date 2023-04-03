import { useState } from "react";
import AddElementsList from "./AddElementsList";
import classNames from "classnames";
import { useCallback } from "react";
import renderIconForType from "../common/renderIconForType";

export enum ElementType {
  Components = "Components",
  Containers = "Containers",
  Modules = "Modules",
}
/**
 * A menu for adding elements to the page.
 */
export default function AddElementMenu(): JSX.Element {
  const [activeType, setType] = useState<ElementType>(ElementType.Components);

  return (
    <div className="absolute z-20 rounded bg-white text-sm text-gray-700 shadow-lg">
      <ElementTypeSwitcher activeType={activeType} setType={setType} />
      <AddElementsList activeType={activeType} />
    </div>
  );
}

function ElementTypeSwitcher(props: {
  activeType: ElementType;
  setType: (elementType: ElementType) => void;
}) {
  const { activeType, setType } = props;

  return (
    <div className="flex px-4 pt-2 border-b">
      {Object.values(ElementType).map((elementType) => {
        return (
          <ElementTypeButton
            key={elementType}
            elementType={elementType}
            isActiveType={elementType === activeType}
            handleClick={setType}
          />
        );
      })}
    </div>
  );
}

function ElementTypeButton(props: {
  isActiveType: boolean;
  elementType: ElementType;
  handleClick: (type: ElementType) => void;
}) {
  const { isActiveType, elementType, handleClick } = props;
  const className = classNames("px-2 py-2 mx-2 flex items-center border-b-2", {
    "border-blue-600": isActiveType,
    "border-transparent": !isActiveType,
  });
  const onClick = useCallback(() => {
    handleClick(ElementType[elementType]);
  }, [elementType, handleClick]);
  return (
    <button className={className} onClick={onClick} disabled={isActiveType}>
      <span className="mr-2 pt-0.5">{renderIconForType(elementType)}</span>
      <span>{elementType}</span>
    </button>
  );
}

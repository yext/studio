import {
  PropValues,
  NestedPropType,
  PropVal,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import { useCallback } from "react";
import PropEditors from "./PropEditors";
import { renderBranchUI } from "./PropEditor";
import classNames from "classnames";

export default function NestedPropEditors(props: {
  propValues?: PropValues;
  propType: NestedPropType;
  propName: string;
  updateProp: (propVal: PropVal) => void;
  propIdentifier?: string;
  isNested?: boolean;
}) {
  const {
    propValues,
    propType,
    propName,
    updateProp,
    propIdentifier = "",
    isNested,
  } = props;
  const updateObjectProp = useCallback(
    (updatedPropValues: PropValues) => {
      updateProp({
        kind: PropValueKind.Literal,
        valueType: PropValueType.Object,
        value: updatedPropValues,
      });
    },
    [updateProp]
  );
  const isUndefinedValue = propValues === undefined;

  const containerClasses = classNames("flex", {
    "mb-2": !isNested,
  });

  return (
    <div className={containerClasses}>
      {renderBranchUI(isNested)}
      <div>
        <span className="text-sm font-semibold mt-0.5 mb-1 whitespace-nowrap">
          {propName}
        </span>
        {isUndefinedValue ? (
          renderUndefinedObject()
        ) : (
          <PropEditors
            propValues={propValues}
            propShape={propType.shape}
            updateProps={updateObjectProp}
            propIdentifier={[propIdentifier, propName].join(",")}
            isNested={true}
          />
        )}
      </div>
    </div>
  );
}

function renderUndefinedObject() {
  const curlyBrackets = "{}";
  return (
    <span className="text-sm text-gray-400 pl-2.5 mt-0.5 mb-1">
      {curlyBrackets}
    </span>
  );
}

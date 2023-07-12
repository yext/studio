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

const EMPTY_PROP_VALUES = {};

export default function NestedPropEditors(props: {
  propValues?: PropValues;
  propType: NestedPropType;
  propName: string;
  updateProp: (propVal: PropVal) => void;
  isNested?: boolean;
  disabled?: boolean;
}) {
  const {
    propValues = EMPTY_PROP_VALUES,
    propType,
    propName,
    updateProp,
    isNested,
    disabled,
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

  const containerClasses = classNames("flex", {
    "mb-2": !isNested,
  });
  const undefinedObjectText = "{}";

  return (
    <div className={containerClasses}>
      {renderBranchUI(isNested)}
      <div>
        <span className="text-sm font-semibold mt-0.5 mb-1 whitespace-nowrap">
          {propName}
        </span>
        {disabled ? (
          <span className="text-sm text-gray-400 pl-2.5 mt-0.5 mb-1">
            {undefinedObjectText}
          </span>
        ) : (
          <PropEditors
            propValues={propValues}
            propShape={propType.shape}
            updateProps={updateObjectProp}
            isNested={true}
          />
        )}
      </div>
    </div>
  );
}

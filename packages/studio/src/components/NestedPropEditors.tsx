import {
  PropValues,
  NestedPropType,
  PropMetadata,
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
  propMetadata: Extract<PropMetadata, NestedPropType>;
  propName: string;
  updateProp: (propVal: PropVal) => void;
  isNested?: boolean;
}) {
  const { propValues, propMetadata, propName, updateProp, isNested } = props;
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
  const curlyBrackets = "{}";
  const undefinedObjectDisplay = (
    <span className="text-sm text-gray-400 pl-2.5 mt-0.5 mb-1">
      {curlyBrackets}
    </span>
  );

  return (
    <div className={containerClasses}>
      {renderBranchUI(isNested)}
      <div>
        <span className="text-sm font-semibold mt-0.5 mb-1 whitespace-nowrap">
          {propName}
        </span>
        {isUndefinedValue ? (
          undefinedObjectDisplay
        ) : (
          <PropEditors
            propValues={propValues}
            propShape={propMetadata.shape}
            updateProps={updateObjectProp}
            isNested={true}
          />
        )}
      </div>
    </div>
  );
}

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
  updateSpecificProp: (propName: string, propVal: PropVal) => void;
  isNested?: boolean;
}) {
  const {
    propValues = EMPTY_PROP_VALUES,
    propType,
    propName,
    updateSpecificProp,
    isNested,
  } = props;
  const updateObjectProp = useCallback(
    (updatedPropValues: PropValues) => {
      updateSpecificProp(propName, {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Object,
        value: updatedPropValues,
      });
    },
    [propName, updateSpecificProp]
  );

  const containerClasses = classNames("flex", {
    "mb-2": !isNested,
  });

  return (
    <div className={containerClasses}>
      {renderBranchUI(isNested)}
      <div>
        <div className="text-sm font-semibold mt-0.5 mb-1">{propName}</div>
        <PropEditors
          propValues={propValues}
          propShape={propType.shape}
          updateProps={updateObjectProp}
          isNested={true}
        />
      </div>
    </div>
  );
}

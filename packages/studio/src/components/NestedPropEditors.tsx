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

  return (
    <div className="flex">
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

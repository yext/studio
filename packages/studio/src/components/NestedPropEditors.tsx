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
import UndefinedMenuButton from "./UndefinedMenuButton";

const EMPTY_PROP_VALUES = {};

export default function NestedPropEditors(props: {
  propValues?: PropValues;
  propType: NestedPropType;
  propName: string;
  updateProp: (propVal: PropVal | undefined) => void;
  isUndefinedValue: boolean;
  required: boolean;
  isNested?: boolean;
}) {
  const {
    propValues = EMPTY_PROP_VALUES,
    propType,
    propName,
    updateProp,
    isUndefinedValue,
    required,
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

  const containerClasses = classNames("flex", {
    "mb-2": !isNested,
  });

  return (
    <div className={containerClasses}>
      {renderBranchUI(isNested)}
      <div>
        <UndefinedMenuButton
          propType={propType}
          isUndefined={isUndefinedValue}
          updateProp={updateProp}
          required={required}
        >
          <div className="text-sm font-semibold mt-0.5 mb-1">{propName}</div>
        </UndefinedMenuButton>
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

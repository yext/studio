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
import UndefinedMenuButton from "./UndefinedMenuButton";

const EMPTY_PROP_VALUES = {};

export default function NestedPropEditors(props: {
  propValues?: PropValues;
  propMetadata: Extract<PropMetadata, NestedPropType>;
  propName: string;
  updateProp: (propVal: PropVal | undefined) => void;
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

  return (
    <div className={containerClasses}>
      {renderBranchUI(isNested)}
      <div>
        <UndefinedMenuButton
          propType={propMetadata}
          isUndefined={isUndefinedValue}
          updateProp={updateProp}
          required={propMetadata.required}
        >
          <div className="text-sm font-semibold mt-0.5 mb-1">{propName}</div>
        </UndefinedMenuButton>
        <PropEditors
          propValues={propValues ?? EMPTY_PROP_VALUES}
          propShape={propMetadata.shape}
          updateProps={updateObjectProp}
          isNested={true}
        />
      </div>
    </div>
  );
}

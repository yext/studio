import {
  PropValues,
  ObjectPropType,
  PropVal,
  PropValueKind,
  PropValueType,
  PropMetadata,
} from "@yext/studio-plugin";
import { useCallback, useMemo } from "react";
import PropEditors from "./PropEditors";
import { renderBranchUI } from "./PropEditor";
import classNames from "classnames";
import { Tooltip } from "react-tooltip";
import { v4 } from "uuid";

const tooltipStyle = { backgroundColor: "black" };

export default function ObjectPropEditor(props: {
  propValues?: PropValues;
  propMetadata: Extract<PropMetadata, ObjectPropType>;
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

  const containerClasses = classNames("flex grow", {
    "mb-2": !isNested,
  });

  const uniqueId = useMemo(() => v4(), []);
  const propTooltipId = `${uniqueId}-prop-tooltip`;

  return (
    <div className={containerClasses}>
      {isNested && renderBranchUI()}
      <div className="flex flex-col grow">
        <span
          className="text-sm font-semibold mt-0.5 mb-1 whitespace-nowrap"
          id={propTooltipId}
        >
          {propName}
        </span>
        {propMetadata.tooltip && (
          <Tooltip
            style={tooltipStyle}
            anchorId={propTooltipId}
            content={propMetadata.tooltip}
            place="left"
          />
        )}
        {isUndefinedValue ? (
          renderUndefinedObject()
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

function renderUndefinedObject() {
  const curlyBrackets = "{}";
  return (
    <span className="text-sm text-gray-400 pl-1 mt-0.5 mb-1">
      {curlyBrackets}
    </span>
  );
}

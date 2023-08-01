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
  const { propValues, propMetadata , propName, updateProp, isNested } = props;
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
  
  const uniqueId = useMemo(() => v4(), []);
  const docTooltipId = `${uniqueId}-doc`;

  return (
    <div className={containerClasses}>
      {renderBranchUI(isNested)}
      <div>
        <span className="text-sm font-semibold mt-0.5 mb-1 whitespace-nowrap" id={docTooltipId}>
          {propName}
        </span>
        {propMetadata.doc && (
            <Tooltip
              style={tooltipStyle}
              anchorId={docTooltipId}
              content={propMetadata.doc}
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
    <span className="text-sm text-gray-400 pl-2.5 mt-0.5 mb-1">
      {curlyBrackets}
    </span>
  );
}

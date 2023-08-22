import {
  ArrayPropType,
  ObjectPropType,
  PropMetadata,
  PropVal,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import { Tooltip } from "react-tooltip";
import PropInput from "./PropInput";
import useOnPropChange from "../hooks/useOnPropChange";
import { v4 } from "uuid";
import classNames from "classnames";
import { useMemo } from "react";

interface PropEditorProps {
  propName: string;
  propMetadata: Exclude<PropMetadata, ObjectPropType | ArrayPropType>;
  propValue?: string | number | boolean;
  propKind: PropValueKind;
  onPropChange: (propVal: PropVal) => void;
  isNested?: boolean;
}

const tooltipStyle = { backgroundColor: "black" };

/**
 * Renders an input editor for a single prop of a component or module.
 */
export default function PropEditor({
  propName,
  propMetadata,
  propValue,
  propKind,
  onPropChange,
  isNested,
}: PropEditorProps) {
  const { type, tooltip } = propMetadata;
  const onChange = useOnPropChange(propKind, propName, onPropChange, type);
  const uniqueId = useMemo(() => v4(), []);
  const labelTooltipId = `${uniqueId}-label`;

  return (
    <div className="flex items-center mb-2 text-sm min-w-0">
      {isNested && renderBranchUI("pb-10")}
      <label className="flex flex-col min-w-0">
        <div className="flex">
          <p className="pb-1" id={labelTooltipId}>
            {propName}
          </p>
        </div>
        <PropInput
          {...{
            propType:
              propKind === PropValueKind.Expression
                ? { type: PropValueType.string }
                : propMetadata,
            propValue,
            onChange,
            propKind,
          }}
        />
      </label>
      {tooltip && (
        <Tooltip
          style={tooltipStyle}
          anchorId={labelTooltipId}
          content={tooltip}
          place="left"
        />
      )}
    </div>
  );
}

export function renderBranchUI(additionalClasses = "") {
  const classes = classNames(
    "mr-1 text-gray-200 -ml-0.5 tracking-[-.2em] whitespace-nowrap",
    additionalClasses
  );
  return <div className={classes}>---</div>;
}

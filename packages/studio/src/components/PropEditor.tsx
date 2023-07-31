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
  const { type, doc } = propMetadata;
  const onChange = useOnPropChange(propKind, propName, onPropChange, type);
  const uniqueId = useMemo(() => v4(), []);
  const labelTooltipId = `${uniqueId}-label`;

  return (
    <div className="flex items-center mb-2 text-sm">
      {renderBranchUI(isNested)}
      <label
        className="flex h-10 items-center justify-self-start"
        id={labelTooltipId}
      >
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
      {doc && (
        <Tooltip
          style={tooltipStyle}
          anchorId={labelTooltipId}
          content={doc}
          place="top"
        />
      )}
    </div>
  );
}

export function renderBranchUI(isNested?: boolean, additionalClasses = "") {
  const classes =
    "mr-1 text-gray-200 -ml-0.5 tracking-[-.2em] whitespace-nowrap " +
    additionalClasses;
  return isNested && <div className={classes}>---</div>;
}

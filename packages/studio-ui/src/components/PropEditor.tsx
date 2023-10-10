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
import { ReactComponent as Info } from "../icons/info.svg";
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
 * Renders an input editor for a single prop of a component.
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
  const inputId = `${uniqueId}-input`;
  const inputContainerClass = classNames({
    "ml-2": isNested,
  });

  return (
    <div className="flex mb-2 text-sm grow flex-col">
      <div className="flex relative">
        {isNested && renderBranchUI()}
        <div className="flex flex-row">
          <label className="pb-1" htmlFor={inputId}>
            {propName}
          </label>
          {tooltip && <Info id={labelTooltipId} className="ml-3 pb-1" data-testid="prop-tooltip"/>}
        </div>
      </div>
      <div className={inputContainerClass}>
        <PropInput
          {...{
            propType:
              propKind === PropValueKind.Expression
                ? { type: PropValueType.string }
                : propMetadata,
            propValue,
            onChange,
            propKind,
            inputId,
          }}
        />
      </div>
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

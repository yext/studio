import {
  ArrayPropType,
  ObjectPropType,
  PropMetadata,
  PropVal,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import PropInput from "./PropInput";
import useOnPropChange from "../hooks/useOnPropChange";
import { v4 } from "uuid";
import classNames from "classnames";
import { useMemo } from "react";
import TooltipIcon from "./common/TooltipIcon";

interface PropEditorProps {
  propName: string;
  propMetadata: Exclude<PropMetadata, ObjectPropType | ArrayPropType>;
  propValue?: string | number | boolean;
  propKind: PropValueKind;
  onPropChange: (propVal: PropVal) => void;
  isNested?: boolean;
}

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
          {tooltip && <TooltipIcon content={tooltip} />}
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

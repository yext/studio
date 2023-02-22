import {
  NestedPropMetadata,
  PropMetadata,
  PropVal,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import cx from "classnames";
import { Tooltip } from "react-tooltip";
import useOnPropChange from "../hooks/useOnPropChange";
import InputLabel from "./common/InputLabel";
import PropInput from "./PropInput";

interface PropEditorProps {
  propName: string;
  propMetadata: Exclude<PropMetadata, NestedPropMetadata>;
  propValue?: string | number | boolean;
  propKind: PropValueKind;
  onPropChange: (propName: string, propVal: PropVal) => void;
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
}: PropEditorProps) {
  const { type, doc, unionValues } = propMetadata;
  const onChange = useOnPropChange(propKind, propName, onPropChange, type);

  // These types will display on one line with label on left and input on right.
  const inlineTypes = [PropValueType.HexColor, PropValueType.boolean];
  const labelWrapperClass = cx({
    "flex items-center justify-between gap-2": inlineTypes.includes(type),
    "flex flex-col gap-1": !inlineTypes.includes(type),
  });

  return (
    <div className="mb-5">
      <label className={labelWrapperClass} id={propName}>
        <InputLabel>{propName}</InputLabel>
        <PropInput
          {...{
            propType:
              propKind === PropValueKind.Expression
                ? PropValueType.string
                : type,
            propValue,
            onChange,
            propKind,
          }}
          unionValues={unionValues}
        />
      </label>
      {doc && (
        <Tooltip
          style={tooltipStyle}
          anchorId={propName}
          content={doc}
          place="top"
        />
      )}
    </div>
  );
}

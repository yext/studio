import {
  NestedPropMetadata,
  PropMetadata,
  PropVal,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import { Tooltip } from "react-tooltip";
import PropInput from "./PropInput";
import useOnPropChange from "../hooks/useOnPropChange";

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
export default function PropEdit({
  propName,
  propMetadata,
  propValue,
  propKind,
  onPropChange,
}: PropEditorProps) {
  const { type, doc, unionValues } = propMetadata;
  const onChange = useOnPropChange(propKind, propName, onPropChange, type);

  return (
    <div className="mb-5">
      <label className="flex h-10 items-center" id={propName}>
        <p className="w-1/4">{propName}</p>
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

import {
  ArrayPropType,
  NestedPropType,
  PropMetadata,
  PropVal,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import { Tooltip } from "react-tooltip";
import PropInput from "./PropInput";
import useOnPropChange from "../hooks/useOnPropChange";
import UndefinedMenuButton from "./UndefinedMenuButton";

interface PropEditorProps {
  propName: string;
  propMetadata: Exclude<PropMetadata, NestedPropType | ArrayPropType>;
  propValue?: string | number | boolean;
  propKind: PropValueKind;
  onPropChange: (propVal: PropVal | undefined) => void;
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

  return (
    <div className="flex items-center mb-2 text-sm">
      {renderBranchUI(isNested)}
      <label
        className="flex h-10 items-center justify-self-start"
        id={propName}
      >
        <UndefinedMenuButton
          propType={propMetadata}
          isUndefined={propValue === undefined}
          updateProp={onPropChange}
          required={propMetadata.required}
        >
          <p className="pr-2">{propName}</p>
        </UndefinedMenuButton>
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
          anchorId={propName}
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

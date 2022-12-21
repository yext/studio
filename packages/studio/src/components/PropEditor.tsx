import {
  PropMetadata,
  PropVal,
  PropValueKind,
  PropValueType,
  TypeGuards,
} from "@yext/studio-plugin";
import { Tooltip } from "react-tooltip";
import { ChangeEvent, useCallback, useState } from "react";
import OptionPicker from "./common/OptionPicker";
import PropInput from "./PropInput";

interface PropEditorProps {
  propName: string;
  propMetadata: PropMetadata;
  initialPropValue?: string | number | boolean;
  currentPropValue?: string | number | boolean;
  currentPropKind?: PropValueKind;
  onPropChange: (propVal: PropVal) => void;
}

const tooltipStyle = { backgroundColor: "black" };
const optionPickerCssClasses = {
  container: "w-1/2 mb-2",
  option: "p-0.5",
  selectedOption: "p-0.5",
};

/**
 * Renders an input editor for a single prop of a component or module.
 */
export function PropEditor({
  propName,
  propMetadata,
  initialPropValue,
  currentPropValue,
  currentPropKind,
  onPropChange,
}: PropEditorProps) {
  const [propKind, setPropKind] = useState<PropValueKind>(
    currentPropKind ?? PropValueKind.Literal
  );
  const { type, doc } = propMetadata;

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let value: string | number | boolean = e.target.value;
      if (propKind === PropValueKind.Literal) {
        if (type === PropValueType.number) {
          value = e.target.valueAsNumber;
        } else if (type === PropValueType.boolean) {
          value = e.target.checked;
        }
      }
      const newPropVal = {
        kind: propKind,
        valueType: type,
        value,
      };
      if (!TypeGuards.isValidPropValue(newPropVal)) {
        console.error(
          `Unable to update component's prop ${propName}. Invalid PropVal:`,
          newPropVal
        );
        return;
      }
      onPropChange(newPropVal);
    },
    [onPropChange, propKind, propName, type]
  );

  return (
    <div className="mb-5">
      <OptionPicker
        options={PropValueKind}
        defaultOption={currentPropKind ?? PropValueKind.Literal}
        onSelect={setPropKind}
        customCssClasses={optionPickerCssClasses}
      />
      <div>
        <label className="flex h-10 items-center" id={propName}>
          <p className="w-1/4">{propName}</p>
          <PropInput
            {...{
              propType:
                propKind === PropValueKind.Expression
                  ? PropValueType.string
                  : type,
              initialPropValue,
              currentPropValue,
              onChange,
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
    </div>
  );
}

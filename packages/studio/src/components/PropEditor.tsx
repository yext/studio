import {
  NestedPropMetadata,
  PropMetadata,
  PropVal,
  PropValueKind,
  PropValueType,
  TypeGuards,
} from "@yext/studio-plugin";
import { Tooltip } from "react-tooltip";
import { useCallback, useState } from "react";
import OptionPicker from "./common/OptionPicker";
import PropInput from "./PropInput";
import getPropTypeDefaultValue from "../utils/getPropTypeDefaultValue";

interface PropEditorProps {
  propName: string;
  propMetadata: Exclude<PropMetadata, NestedPropMetadata>;
  currentPropValue?: string | number | boolean;
  currentPropKind?: PropValueKind;
  onPropChange: (propName: string, propVal: PropVal) => void;
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
  currentPropValue,
  currentPropKind,
  onPropChange,
}: PropEditorProps) {
  const [propKind, setPropKind] = useState<PropValueKind>(
    currentPropKind ?? PropValueKind.Literal
  );
  const { type, doc } = propMetadata;

  const onChange = useCallback(
    (value: string | number | boolean, kind?: PropValueKind) => {
      const newPropVal = {
        kind: kind ?? propKind,
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
      onPropChange(propName, newPropVal);
    },
    [onPropChange, propKind, propName, type]
  );

  const optionPickerOnSelect = useCallback(
    (option: PropValueKind) => {
      setPropKind(option);
      let value = currentPropValue ?? getPropTypeDefaultValue(type);
      if (option === PropValueKind.Expression) {
        value = value.toString();
      }
      onChange(value, option);
    },
    [currentPropValue, onChange, type]
  );

  return (
    <div className="mb-5">
      <OptionPicker
        options={PropValueKind}
        defaultOption={currentPropKind ?? PropValueKind.Literal}
        onSelect={optionPickerOnSelect}
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

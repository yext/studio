import {
  PropMetadata,
  PropVal,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import { TypeGuards } from "@yext/studio-plugin";
import { Tooltip } from "react-tooltip";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import OptionPicker from "./common/OptionPicker";
import PropInput from "./PropInput";

interface PropEditorProps<T = string | number | boolean> {
  propName: string;
  propMetadata: PropMetadata;
  initialPropValue?: T;
  currentPropValue?: T;
  currentPropKind?: PropValueKind;
  onPropChange: (propVal: PropVal) => void;
}

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
          "Unable to update component's prop state. Invalid PropVal:",
          newPropVal
        );
        return;
      }
      onPropChange(newPropVal);
    },
    [onPropChange, propKind, type]
  );

  const toolTipStyle = useMemo(() => {
    return { backgroundColor: "black" };
  }, []);

  const optionPickerCssClasses = useMemo(
    () => ({
      container: "w-1/2 mb-2",
      option: "p-0.5",
      selectedOption: "p-0.5",
    }),
    []
  );

  return (
    <div className="mb-5">
      <OptionPicker
        options={PropValueKind}
        defaultOption={PropValueKind.Literal}
        onSelect={setPropKind}
        customCssClasses={optionPickerCssClasses}
      />
      <div className="flex h-10 items-center">
        <label className="w-1/4" id={propName}>
          {propName}
        </label>
        {doc && (
          <Tooltip
            style={toolTipStyle}
            anchorId={propName}
            content={doc}
            place="top"
          />
        )}
        <div className="w-3/4">
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
        </div>
      </div>
    </div>
  );
}

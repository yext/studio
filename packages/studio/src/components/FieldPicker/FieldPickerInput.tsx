import { ChangeEventHandler } from "react";
import useStudioStore from "../../store/useStudioStore";
import FieldPicker from "./FieldPicker";
import { useFuncWithZundoBatching } from "../../hooks/useFuncWithZundoBatching";

interface FieldPickerInputProps {
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  handleFieldSelection: (fieldId: string) => void;
  displayValue: string;
  fieldType: "string" | "array";
}

const inputBoxCssClasses =
  "border border-gray-300 focus:border-indigo-500 rounded-lg py-2 pl-2 pr-8 w-full";

/**
 * FieldPickerInput is a a text input element combined with a FieldPicker.
 */
export default function FieldPickerInput({
  onInputChange,
  handleFieldSelection,
  displayValue,
  fieldType,
}: FieldPickerInputProps) {
  const entityData = useStudioStore((store) => store.pages.activeEntityData);
  const onChange = useFuncWithZundoBatching(onInputChange);

  return (
    <div className="relative">
      <input
        type="text"
        onChange={onChange}
        className={inputBoxCssClasses}
        value={displayValue}
      />
      <i className="absolute right-0 top-2.5 mr-2 bg-white not-italic">
        {entityData && (
          <FieldPicker
            fieldType={fieldType}
            handleFieldSelection={handleFieldSelection}
            entityData={entityData}
          />
        )}
      </i>
    </div>
  );
}

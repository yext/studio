import { ChangeEventHandler } from "react";
import useStreamDocument from "../../hooks/useStreamDocument";
import FieldPicker from "./FieldPicker";

interface FieldPickerInputProps {
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  onFieldSelection: (field: string) => void;
  displayValue: string;
  disabled?: boolean;
  fieldType: "string" | "array";
}

const inputBoxCssClasses =
  "border border-gray-300 focus:border-indigo-500 rounded-lg p-2 w-full";

/**
 * FieldPickerInput is a a text input element combined with a FieldPicker.
 */
export default function FieldPickerInput({
  onInputChange,
  onFieldSelection,
  displayValue,
  fieldType,
}: FieldPickerInputProps) {
  const streamDocument = useStreamDocument();

  return (
    <div className="relative">
      <input
        type="text"
        onChange={onInputChange}
        className={inputBoxCssClasses}
        value={displayValue}
      />
      <i className="absolute right-0 top-2.5 mr-2 bg-white">
        <FieldPicker
          fieldType={fieldType}
          handleFieldSelection={onFieldSelection}
          streamDocument={streamDocument}
        />
      </i>
    </div>
  );
}

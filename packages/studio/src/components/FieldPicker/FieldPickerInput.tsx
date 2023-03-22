import { ChangeEventHandler } from "react";
import useStreamDocument from "../../hooks/useStreamDocument";
import FieldPicker from "./FieldPicker";

interface FieldPickerInputProps {
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  handleFieldSelection: (fieldId: string) => void;
  displayValue: string;
  fieldType: "string" | "array";
}

const inputBoxCssClasses =
  "border border-gray-300 focus:border-indigo-500 rounded-lg p-2 w-full";

/**
 * FieldPickerInput is a a text input element combined with a FieldPicker.
 */
export default function FieldPickerInput({
  onInputChange,
  handleFieldSelection,
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
      <i className="absolute right-0 top-2.5 mr-2 bg-white not-italic">
        {streamDocument && (
          <FieldPicker
            fieldType={fieldType}
            handleFieldSelection={handleFieldSelection}
            streamDocument={streamDocument}
          />
        )}
      </i>
    </div>
  );
}

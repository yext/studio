import { ChangeEventHandler } from "react";
import useStudioStore from "../../store/useStudioStore";
import FieldPicker from "./FieldPicker";
import { useFuncWithZundoBatching } from "../../hooks/useFuncWithZundoBatching";
import filterEntityData from "../../utils/filterEntityData";
import classNames from "classnames";

interface FieldPickerInputProps {
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  handleFieldSelection: (fieldId: string) => void;
  displayValue: string;
  fieldFilter: (value: unknown) => boolean;
}

/**
 * FieldPickerInput is a a text input element combined with a FieldPicker.
 */
export default function FieldPickerInput({
  onInputChange,
  handleFieldSelection,
  displayValue,
  fieldFilter,
}: FieldPickerInputProps) {
  const entityData = useStudioStore((store) => store.pages.activeEntityData);
  const filteredData = filterEntityData(fieldFilter, entityData);
  const hasFilteredData = Object.keys(filteredData).length > 0;
  const inputBoxCssClasses = classNames(
    "border border-gray-300 focus:border-indigo-500 rounded-lg py-2 pl-2 w-full",
    hasFilteredData ? "pr-8" : "pr-2"
  );

  const onChange = useFuncWithZundoBatching(onInputChange);

  return (
    <div className="relative">
      <input
        type="text"
        onChange={onChange}
        className={inputBoxCssClasses}
        value={displayValue}
      />
      {hasFilteredData && (
        <i className="absolute right-0 top-2.5 mr-2 bg-white not-italic">
          <FieldPicker
            handleFieldSelection={handleFieldSelection}
            filteredEntityData={filteredData}
          />
        </i>
      )}
    </div>
  );
}

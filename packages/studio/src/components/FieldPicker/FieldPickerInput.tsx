import { ChangeEventHandler, useCallback, useMemo } from "react";
import useStudioStore from "../../store/useStudioStore";
import FieldPicker from "./FieldPicker";
import useTemporalStore from "../../store/useTemporalStore";
import { debounce } from "lodash";

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
  const onChange = useTemporalDebouncedFunc(onInputChange);

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useTemporalDebouncedFunc<P extends Array<any>, R>(
  func: (...args: P) => R
): typeof func {
  const [pause, resume] = useTemporalStore((store) => [
    store.pause,
    store.resume,
  ]);
  const debouncedResume = useMemo(() => debounce(resume, 500), [resume]);

  return useCallback(
    (...args: P): R => {
      const val = func(...args);
      pause();
      debouncedResume();
      return val;
    },
    [func, debouncedResume, pause]
  );
}

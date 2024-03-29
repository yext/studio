import classNames from "classnames";
import { ChangeEvent } from "react";

interface ToggleProps {
  checked?: boolean;
  onToggle?: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  inputId?: string;
}

export default function Toggle({
  checked,
  onToggle,
  disabled,
  inputId,
}: ToggleProps) {
  const labelClasses = classNames("inline-flex relative items-center", {
    "cursor-pointer": !disabled,
  });
  return (
    <label className={labelClasses}>
      <input
        type="checkbox"
        checked={checked}
        className="sr-only peer"
        onChange={onToggle}
        disabled={disabled}
        id={inputId}
      />
      <div className="w-11 h-6 bg-gray-400 rounded-full peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:bg-gray-200"></div>
    </label>
  );
}

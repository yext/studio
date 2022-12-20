import { PropValueType } from "@yext/studio-plugin";
import { ChangeEvent } from "react";
import Toggle from "./common/Toggle";

interface PropInputProps<T = string | number | boolean> {
  propType: PropValueType;
  initialPropValue?: T;
  currentPropValue?: T;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Renders the input element of a PropEditor component, that
 * will update the corresponding prop's value for the active
 * component based on user's input.
 */
export default function PropInput({
  propType,
  initialPropValue,
  currentPropValue,
  onChange,
}: PropInputProps): JSX.Element {
  const propVal = currentPropValue ?? initialPropValue;
  switch (propType) {
    case PropValueType.number:
      return (
        <input
          type="number"
          onChange={onChange}
          className="border border-gray-500 focus:border-blue-600 rounded-lg px-2 py-1 w-full"
          value={propVal as number}
        />
      );
    case PropValueType.string:
      return (
        <input
          type="text"
          onChange={onChange}
          className="border border-gray-500 focus:border-blue-600 rounded-lg px-2 py-1 w-full"
          value={propVal as string}
        />
      );
    case PropValueType.boolean:
      return <Toggle checked={propVal as boolean} onToggle={onChange} />;
    case PropValueType.HexColor:
      return (
        <input type="color" onChange={onChange} value={propVal as string} />
      );
    default:
      return <div>Unknown PropValueType {propType}.</div>;
  }
}

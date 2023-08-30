import { useCallback, useEffect, useState } from "react";
import generateTailwindSafelist from "../utils/generateTailwindSafelist";
import { StudioTailwindTheme } from "@yext/studio-plugin";
import PillPickerInput from "./PillPicker/PillPickerInput";

const customClassesPromise: Promise<string[] | undefined> = import(
  "@pathToUserProjectRoot/tailwind.config"
)
  .then((module) => {
    const theme: StudioTailwindTheme | undefined =
      module.default?.theme?.extend;
    return theme && generateTailwindSafelist(theme);
  })
  .catch((e) => {
    console.error(e);
    return undefined;
  });

interface Props {
  onChange: (value: string) => void;
  value: string;
  disabled: boolean;
}

export default function TailwindPropInput({
  onChange,
  value,
  disabled,
}: Props) {
  const availableClasses = useAvailableTailwindClasses(value);

  const addTailwindClass = useCallback(
    (tailwindClass: string) => {
      const tailwindClasses = new Set(splitValue(value));
      tailwindClasses.add(tailwindClass);
      const combinedClass = [...tailwindClasses].join(" ");
      onChange(combinedClass);
    },
    [onChange, value]
  );

  const removeTailwindClass = useCallback(
    (tailwindClass: string) => {
      const tailwindClasses = new Set(splitValue(value));
      tailwindClasses.delete(tailwindClass);
      const combinedClass = [...tailwindClasses].join(" ");
      onChange(combinedClass);
    },
    [onChange, value]
  );

  return (
    <PillPickerInput
      selectedItems={splitValue(value)}
      availableItems={availableClasses}
      selectItem={addTailwindClass}
      removeItem={removeTailwindClass}
      emptyText="No custom tailwind config found."
      disabled={disabled}
    />
  );
}

function splitValue(value: string): string[] {
  return value.split(" ").filter((v) => v);
}

function useAvailableTailwindClasses(value: string) {
  const [customClasses, setCustomClasses] = useState<string[]>();

  useEffect(() => {
    if (customClasses) {
      return;
    }
    void customClassesPromise.then(setCustomClasses);
  }, [customClasses]);

  return customClasses?.filter(
    (tailwindClass) => !value.includes(tailwindClass)
  );
}

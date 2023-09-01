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

  const updateClasses = useCallback(
    (classes: string[]) => onChange(classes.join(" ")),
    [onChange]
  );

  return (
    <PillPickerInput
      selectedItems={splitValue(value)}
      availableItems={availableClasses}
      updateSelectedItems={updateClasses}
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

import {
  PropVal,
  PropValueKind,
  PropValueType,
  TypeGuards,
} from "@yext/studio-plugin";
import { useCallback } from "react";

/**
 * A callback for handling an update to a prop.
 */
export default function useOnPropChange(
  propKind: PropValueKind,
  propName: string,
  onPropChange: (propVal: PropVal) => void,
  valueType: PropValueType
) {
  return useCallback(
    (value: string | number | boolean) => {
      const newPropVal = createPropVal(value, propKind, valueType);
      if (!newPropVal) {
        console.error(
          `Unable to update component's prop ${propName}. Invalid PropVal:`,
          newPropVal
        );
        return;
      }
      onPropChange(newPropVal);
    },
    [onPropChange, propKind, propName, valueType]
  );
}

function createPropVal(
  value: string | number | boolean,
  propKind: PropValueKind,
  valueType: PropValueType
): PropVal | null {
  const newPropVal = {
    kind: propKind,
    valueType,
    value,
  };
  if (
    !TypeGuards.isValidPropVal(newPropVal) &&
    valueType === PropValueType.number &&
    typeof value === "string"
  ) {
    // this only occurs when the number fieldpicker is used
    return {
      kind: PropValueKind.Expression,
      valueType: PropValueType.string,
      value,
    };
  } else if (!TypeGuards.isValidPropVal(newPropVal)) {
    return null;
  }
  return newPropVal;
}

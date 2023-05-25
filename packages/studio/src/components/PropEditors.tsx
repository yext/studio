import {
  PropShape,
  PropVal,
  PropValues,
  PropValueType,
  PropValueKind,
  PropMetadata,
} from "@yext/studio-plugin";
import PropEditor from "./PropEditor";
import PropValueHelpers from "../utils/PropValueHelpers";
import { useCallback } from "react";
import NestedPropEditors from "./NestedPropEditors";

export default function PropEditors(props: {
  propShape: PropShape;
  propValues: PropValues;
  updateProps: (propVal: PropValues) => void;
}) {
  const { propShape, propValues, updateProps } = props;
  const updateSpecificProp = useCallback(
    (propName: string, propVal: PropVal) => {
      updateProps({
        ...propValues,
        [propName]: propVal,
      });
    },
    [propValues, updateProps]
  );

  const propEditors = Object.entries(propShape).map(
    ([propName, propMetadata]) => {
      if (propMetadata.type === PropValueType.Record) {
        return null;
      }

      const propVal: PropVal | undefined = propValues?.[propName];

      if (propMetadata.type === PropValueType.Object) {
        if (propVal?.valueType && propVal.valueType !== PropValueType.Object) {
          console.error(
            `Mismatching propMetadata type ${propMetadata.type} for ${propName}.`
          );
          return null;
        }

        return (
          <NestedPropEditors
            key={propName}
            propValues={propVal?.value}
            propMetadata={propMetadata}
            propName={propName}
            updateSpecificProp={updateSpecificProp}
          />
        );
      }

      const propKind = getPropKind(propMetadata);

      return (
        <PropEditor
          key={propName}
          onPropChange={updateSpecificProp}
          propKind={propKind}
          propName={propName}
          propMetadata={propMetadata}
          propValue={PropValueHelpers.getPropValue(propVal, propKind)}
        />
      );
    }
  );

  return <>{propEditors}</>;
}

/**
 * Returns the PropValueKind to render in the UI for the given PropMetadata.
 */
function getPropKind(propMetadata: PropMetadata) {
  if (propMetadata.type === PropValueType.string && !propMetadata.unionValues) {
    // All non-union strings are expected to be treated as expressions so that
    // string interpolation works as expected in the UI.
    return PropValueKind.Expression;
  }

  return PropValueKind.Literal;
}

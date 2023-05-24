import {
  PropShape,
  PropVal,
  PropValues,
  PropValueType,
  PropValueKind,
  ObjectProp,
  NestedPropMetadata,
  PropMetadata,
} from "@yext/studio-plugin";
import PropEditor from "./PropEditor";
import PropValueHelpers from "../utils/PropValueHelpers";
import { useCallback } from "react";

export default function PropEditors(props: {
  propShape: PropShape;
  propValues: PropValues | undefined;
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
            propVal={propVal}
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

function NestedPropEditors(props: {
  propVal: ObjectProp | undefined;
  propMetadata: NestedPropMetadata;
  propName: string;
  updateSpecificProp: (propName: string, propVal: PropVal) => void;
}) {
  const { propVal, propMetadata, propName, updateSpecificProp } = props;
  const updateObjectProp = useCallback(
    (updatedPropValues: PropValues) => {
      updateSpecificProp(propName, {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Object,
        value: updatedPropValues,
      });
    },
    [propName, updateSpecificProp]
  );

  return (
    <div className="ml-2">
      <div className="font-semibold">{propName}</div>
      <PropEditors
        propValues={propVal?.value}
        propShape={propMetadata.shape}
        updateProps={updateObjectProp}
      />
    </div>
  );
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

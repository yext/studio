import {
  PropValues,
  NestedPropMetadata,
  PropVal,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import { useCallback } from "react";
import PropEditors from "./PropEditors";

const EMPTY_PROP_VALUES = {};

export default function NestedPropEditors(props: {
  propValues?: PropValues;
  propMetadata: NestedPropMetadata;
  propName: string;
  updateSpecificProp: (propName: string, propVal: PropVal) => void;
}) {
  const {
    propValues = EMPTY_PROP_VALUES,
    propMetadata,
    propName,
    updateSpecificProp,
  } = props;
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
        propValues={propValues}
        propShape={propMetadata.shape}
        updateProps={updateObjectProp}
      />
    </div>
  );
}

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
  isNested?: boolean;
}) {
  const {
    propValues = EMPTY_PROP_VALUES,
    propMetadata,
    propName,
    updateSpecificProp,
    isNested,
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
    <div className="flex">
      {isNested && (
        <div className="mr-1 text-gray-200 -ml-0.5 tracking-tighter text-sm">
          --
        </div>
      )}
      <div>
        <div className="text-sm mb-2 font-semibold">{propName}</div>
        <PropEditors
          propValues={propValues}
          propShape={propMetadata.shape}
          updateProps={updateObjectProp}
          isNested={true}
        />
      </div>
    </div>
  );
}

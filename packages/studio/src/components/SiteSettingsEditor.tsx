import {
  PropVal,
  PropValueType,
  PropValues,
  PropValueKind,
  PropShape,
} from "@yext/studio-plugin";
import { useCallback } from "react";
import useStudioStore from "../store/useStudioStore";
import PropInput from "./PropInput";

/**
 * SiteSettingsEditor renders an editor for SiteSettings.
 * It supports nested SiteSettings.
 */
export default function SiteSettingsEditor(): JSX.Element {
  const [shape, values, setValues] = useStudioStore((store) => [
    store.siteSettings.shape ?? {},
    store.siteSettings.values ?? {},
    store.siteSettings.setValues,
  ]);

  const updateValues = useCallback(
    (newValues: PropValues) => {
      setValues({ ...values, ...newValues });
    },
    [values, setValues]
  );

  return (
    <RecursiveEditorGroup values={values} shape={shape} updateValues={updateValues} />
  );
}

/**
 * RecursiveEditorGroup renders a particular PropValues and PropShape within SiteSettingsEditor.
 * It handles nested SiteSettings by recursively calling itself via ChildEditorGroup.
 */
function RecursiveEditorGroup(props: {
  values: PropValues;
  shape: PropShape;
  updateValues: (newValues: PropValues) => void;
  parentPropName?: string;
}) {
  const { values, shape, updateValues, parentPropName } = props;
  const childEditorGroups = Object.entries(shape).map(
    ([propName, propMetadata]) => {
      const { valueType, value } = values[propName];
      if (
        valueType !== PropValueType.Object ||
        propMetadata.type !== PropValueType.Object
      ) {
        return null;
      }

      return (
        <ChildEditorGroup
          propName={propName}
          values={value}
          shape={propMetadata.shape}
          updateValues={updateValues}
          key={propName}
        />
      );
    }
  );

  const propInputs = Object.entries(shape).map(([propName, propMetadata]) => {
    const { kind, valueType, value } = values[propName];

    if (
      valueType === PropValueType.Object ||
      propMetadata.type === PropValueType.Object ||
      kind !== PropValueKind.Literal
    ) {
      return null;
    }

    return (
      <PropInputWrapper
        propName={propName}
        value={value}
        valueType={valueType}
        updateValues={updateValues}
        key={propName}
      />
    );
  });

  return (
    <div>
      {parentPropName && (
        <div className="font-bold px-2 pb-2">{parentPropName}</div>
      )}
      {[...childEditorGroups, ...propInputs]
        .filter((jsx) => !!jsx)
        .reduce((prev, curr, index) => {
          if (prev.length > 0) {
            prev.push(
              <hr className="bg-gray-300 h-0.5 rounded-md my-4" key={index} />
            );
          }
          prev.push(curr);
          return prev;
        }, [] as (JSX.Element | null)[])}
    </div>
  );
}

/**
 * ChildEditorGroup is a wrapper around RecursiveEditorGroup.
 * This component is necessary so that handleUpdate can be
 * defined via useCallback.
 */
function ChildEditorGroup(props: {
  propName: string;
  shape: PropShape;
  values: PropValues;
  updateValues: (newValues: PropValues) => void;
}) {
  const { propName, shape, values, updateValues } = props;

  const handleUpdate = useCallback(
    (newValues: PropValues) => {
      updateValues({
        [propName]: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.Object,
          value: {
            ...values,
            ...newValues,
          },
        },
      });
    },
    [propName, values, updateValues]
  );

  return (
    <RecursiveEditorGroup
      key={propName}
      values={values}
      shape={shape}
      updateValues={handleUpdate}
      parentPropName={propName}
    />
  );
}
/**
 * PropInputWrapper is a wrapper around PropInput.
 * This component is necessary so that handleUpdate can be
 * defined via useCallback.
 */
function PropInputWrapper(props: {
  propName: string;
  value: string | number | boolean;
  valueType: PropValueType;
  updateValues: (newValues: PropValues) => void;
}) {
  const { propName, updateValues, valueType, value } = props;

  const handleChange = useCallback((val: string | number | boolean) => {
    updateValues({
      [propName]: {
        kind: PropValueKind.Literal,
        valueType: valueType,
        value: val,
      } as PropVal,
    });
  }, [propName, updateValues, valueType]);

  return (
    <label className="flex h-10 items-center" id={propName} key={propName}>
      <span className="px-2">{propName}</span>
      <PropInput
        propType={valueType}
        currentPropValue={value}
        onChange={handleChange}
      />
    </label>
  );
}

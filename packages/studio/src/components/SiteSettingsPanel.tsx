import {
  PropValueType,
  SiteSettingsValues,
  LiteralProp,
  SiteSettingsShape,
  ObjectProp,
  NestedPropType,
  TypeGuards,
  PropValueKind,
  SiteSettingsPropValueType,
  PropType,
} from "@yext/studio-plugin";
import React, { useCallback, useMemo } from "react";
import { startCase } from "lodash";
import useStudioStore from "../store/useStudioStore";
import PropInput from "./PropInput";

/**
 * SiteSettingsPanel renders an editor for SiteSettings.
 * It supports SiteSettings that contain nested objects.
 */
export default function SiteSettingsPanel(): JSX.Element {
  const [siteSettingsShape, siteSettingsValues, setValues] = useStudioStore(
    (store) => [
      store.siteSettings.shape ?? {},
      store.siteSettings.values ?? {},
      store.siteSettings.setValues,
    ]
  );

  const updateValues = useCallback(
    (propName: string, updatedProp: LiteralProp<SiteSettingsValues>) => {
      setValues({ ...siteSettingsValues, [propName]: updatedProp });
    },
    [siteSettingsValues, setValues]
  );

  return (
    <div>
      {renderSiteSettings(siteSettingsShape, siteSettingsValues, updateValues)}
    </div>
  );
}

/**
 * Renders the given SiteSettingsShape and SiteSettingsValues.
 *
 * Sorts the SiteSettingsShape so that site settings values that are
 * objects are rendered first.
 */
function renderSiteSettings(
  siteSettingsShape: SiteSettingsShape,
  siteSettingsValues: SiteSettingsValues,
  updateValues: (
    propName: string,
    updatedProp: LiteralProp<SiteSettingsValues>
  ) => void
) {
  const sortedShape = Object.entries(siteSettingsShape).sort(
    ([_, firstMetadata]) => {
      return firstMetadata.type === PropValueType.Object ? -1 : 1;
    }
  );

  return sortedShape.map(([propName, propMetadata], index) => {
    const valueType = propMetadata.type;
    const propVal: LiteralProp<SiteSettingsValues> | undefined =
      siteSettingsValues[propName];
    if (valueType !== PropValueType.Object) {
      return (
        <SimplePropInput
          propName={propName}
          key={propName}
          valueType={valueType}
          value={propVal?.value as string | number | boolean}
          updateValues={updateValues}
          unionValues={propMetadata["unionValues"]}
        />
      );
    }

    const shouldRenderDivider = index < sortedShape.length - 1;
    return (
      <React.Fragment key={propName}>
        <div className="font-bold pb-2">{propName}</div>
        <RecursiveGroup
          propName={propName}
          propVal={propVal as ObjectProp<SiteSettingsValues>}
          propType={propMetadata}
          updateValues={updateValues}
        />
        {shouldRenderDivider && (
          <hr className="bg-gray-300 h-0.5 rounded-md my-4" />
        )}
      </React.Fragment>
    );
  });
}

/**
 * RecursiveGroup renders a sub-grouping of SiteSettings.
 * It handles nested SiteSettings by recursively calling itself via renderSiteSettings.
 */
function RecursiveGroup(props: {
  propVal: ObjectProp<SiteSettingsValues>;
  propType: NestedPropType<SiteSettingsPropValueType>;
  updateValues: (
    propName: string,
    updatedProp: LiteralProp<SiteSettingsValues>
  ) => void;
  propName: string;
}) {
  const { propType, updateValues, propName, propVal } = props;

  const updateChildValues = useCallback(
    (childPropName: string, updatedProp: LiteralProp<SiteSettingsValues>) => {
      updateValues(propName, {
        ...propVal,
        value: {
          ...propVal.value,
          [childPropName]: updatedProp,
        },
      });
    },
    [updateValues, propName, propVal]
  );

  return (
    <>{renderSiteSettings(propType.shape, propVal.value, updateChildValues)}</>
  );
}

function SimplePropInput(props: {
  valueType: Exclude<SiteSettingsPropValueType, PropValueType.Object>;
  value?: string | number | boolean;
  updateValues: (
    propName: string,
    updatedProp: LiteralProp<SiteSettingsValues>
  ) => void;
  propName: string;
  unionValues?: string[];
}) {
  const { value, valueType, updateValues, propName, unionValues } = props;
  const handleUpdate = useCallback(
    (rawValue: string | number | boolean) => {
      const updatedValue = {
        kind: PropValueKind.Literal,
        value: rawValue,
        valueType,
      };
      if (!TypeGuards.isValidPropVal(updatedValue)) {
        console.error(
          "Invalid PropVal when updating SiteSettings:",
          updatedValue
        );
        return null;
      }
      updateValues(propName, updatedValue);
    },
    [propName, updateValues, valueType]
  );

  const propType: PropType = useMemo(
    () => ({
      type: valueType,
    }),
    [valueType]
  );

  return (
    <label id={propName} className="flex flex-col mb-2">
      <span>{startCase(propName)}</span>
      <PropInput
        propType={propType}
        propValue={value}
        onChange={handleUpdate}
        unionValues={unionValues}
        propKind={PropValueKind.Literal}
      />
    </label>
  );
}

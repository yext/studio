import {
  PropValueType,
  SiteSettingsValues,
  LiteralProp,
  SiteSettingsShape,
  ObjectProp,
  NestedPropMetadata,
  TypeGuards,
  PropValueKind,
  SiteSettingsPropValueType,
} from "@yext/studio-plugin";
import React, { useCallback } from "react";
import useStudioStore from "../store/useStudioStore";
import PropInput from "./PropInput";

/**
 * SiteSettingsEditor renders an editor for SiteSettings.
 * It supports SiteSettings that contain nested objects.
 */
export default function SiteSettingsEditor(): JSX.Element {
  const [siteSettingsShape, siteSettingsValues, setValues] = useStudioStore(
    (store) => [
      store.siteSettings.shape ?? {},
      store.siteSettings.values ?? {},
      store.siteSettings.setValues,
    ]
  );

  const updateValues = useCallback(
    (propName: string, updatedProp: LiteralProp<SiteSettingsValues>) => {
      console.log('updatevalues', propName, updatedProp)
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
    const propVal: LiteralProp<SiteSettingsValues> | undefined = siteSettingsValues[propName];
    const valueType = propMetadata.type
    if (valueType !== PropValueType.Object) {
      return (
        <SimplePropInput
          key={propName}
          propName={propName}
          valueType={valueType}
          value={propVal?.value as string | number | boolean}
          updateValues={updateValues}
        />
      );
    }

    const shouldRenderDivider = index < sortedShape.length - 1;
    return (
      <React.Fragment key={propName}>
        <div className="font-bold px-2 pb-2">{propName}</div>
        <RecursiveGroup
          propName={propName}
          propVal={propVal as ObjectProp<SiteSettingsValues>}
          propMetadata={propMetadata}
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
  propMetadata: NestedPropMetadata<SiteSettingsPropValueType>;
  updateValues: (
    propName: string,
    updatedProp: LiteralProp<SiteSettingsValues>
  ) => void;
  propName: string;
}) {
  const { propMetadata, updateValues, propName, propVal } = props;

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
    <>
      {renderSiteSettings(propMetadata.shape, propVal.value, updateChildValues)}
    </>
  );
}

function SimplePropInput(props: {
  valueType: Exclude<SiteSettingsPropValueType, PropValueType.Object>,
  value?: string | number | boolean,
  updateValues: (
    propName: string,
    updatedProp: LiteralProp<SiteSettingsValues>
  ) => void;
  propName: string;
}) {
  const { value, valueType, updateValues, propName } = props;
  const handleUpdate = useCallback(
    (rawValue: string | number | boolean) => {
      const updatedValue = {
        kind: PropValueKind.Literal,
        value: rawValue,
        valueType
      };
      if (!TypeGuards.isValidPropValue(updatedValue)) {
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

  return (
    <label className="flex h-10 items-center" id={propName} key={propName}>
      <span className="px-2">{propName}</span>
      <PropInput
        propType={valueType}
        currentPropValue={value}
        onChange={handleUpdate}
      />
    </label>
  );
}

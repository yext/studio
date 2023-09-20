import {
  PropValueType,
  SiteSettingsValues,
  SiteSettingsShape,
  ObjectProp,
  ObjectPropType,
  TypeGuards,
  PropValueKind,
  SiteSettingsPropValueType,
  PropType,
  SiteSettingsVal,
} from "@yext/studio-plugin";
import React, { useCallback } from "react";
import startCase from "lodash/startCase";
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
    (propName: string, updatedProp: SiteSettingsVal) => {
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
  updateValues: (propName: string, updatedProp: SiteSettingsVal) => void
) {
  const sortedShape = Object.entries(siteSettingsShape).sort(
    ([_, firstMetadata]) => {
      return firstMetadata.type === PropValueType.Object ? -1 : 1;
    }
  );

  return sortedShape.map(([propName, propMetadata], index) => {
    const propVal: SiteSettingsVal | undefined = siteSettingsValues[propName];
    if (propMetadata.type !== PropValueType.Object) {
      return (
        <SimplePropInput
          propName={propName}
          key={propName}
          propType={propMetadata}
          value={propVal?.value as string | number | boolean}
          updateValues={updateValues}
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
  propType: ObjectPropType<SiteSettingsPropValueType>;
  updateValues: (propName: string, updatedProp: SiteSettingsVal) => void;
  propName: string;
}) {
  const { propType, updateValues, propName, propVal } = props;

  const updateChildValues = useCallback(
    (childPropName: string, updatedProp: SiteSettingsVal) => {
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
  propType: PropType<Exclude<SiteSettingsPropValueType, PropValueType.Object>>;
  value?: string | number | boolean;
  updateValues: (propName: string, updatedProp: SiteSettingsVal) => void;
  propName: string;
}) {
  const { value, propType, updateValues, propName } = props;
  const handleUpdate = useCallback(
    (rawValue: string | number | boolean) => {
      const updatedValue = {
        kind: PropValueKind.Literal,
        value: rawValue,
        valueType: propType.type,
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
    [propName, updateValues, propType]
  );

  return (
    <label id={propName} className="flex flex-col mb-2">
      <span>{startCase(propName)}</span>
      <PropInput
        propType={propType}
        propValue={value}
        onChange={handleUpdate}
        propKind={PropValueKind.Literal}
      />
    </label>
  );
}

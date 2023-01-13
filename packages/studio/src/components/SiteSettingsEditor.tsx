import {
  PropValueType,
  SiteSettingsValues,
  LiteralProp,
  SiteSettingsShape,
  ObjectProp,
  NestedPropMetadata,
  TypeGuards,
} from "@yext/studio-plugin";
import React, { useCallback } from "react";
import useStudioStore from "../store/useStudioStore";
import PropInput from "./PropInput";

/**
 * SiteSettingsEditor renders an editor for SiteSettings.
 * It supports nested SiteSettings.
 */
export default function SiteSettingsEditor(): JSX.Element {
  const [siteSettingsShape, siteSettingsValues, setValues] = useStudioStore((store) => [
    store.siteSettings.shape ?? {},
    store.siteSettings.values ?? {},
    store.siteSettings.setValues,
  ]);

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
 * RecursiveEditorGroup renders a particular SiteSettingsValues and SiteSettingsShape within SiteSettingsEditor.
 * It handles nested SiteSettings by recursively calling itself via ChildEditorGroup.
 */
function RecursiveEditorGroup(props: {
  propVal: ObjectProp<SiteSettingsValues>;
  propMetadata: NestedPropMetadata;
  updateValues: (propName: string, updatedProp: LiteralProp<SiteSettingsValues>) => void;
  propName: string;
}) {
  const { propMetadata, updateValues, propName, propVal } = props;

  const updateChildValues = useCallback(
    (childPropName: string, updatedProp: LiteralProp<SiteSettingsValues>) => {
      updateValues(propName, {
        ...propVal,
        value: {
          ...propVal.value,
          [childPropName]: updatedProp
        }
      });
    },
    [updateValues, propName, propVal]
  );

  return (
    <>{renderSiteSettings(propMetadata.shape, propVal.value, updateChildValues)}</>
  );
}

function renderSiteSettings(
  siteSettingsShape: SiteSettingsShape,
  siteSettingsValues: SiteSettingsValues,
  updateValues: (propName: string, updatedProp: LiteralProp<SiteSettingsValues>) => void
) {
  const sortedShape = Object.entries(siteSettingsShape).sort(([_, firstMetadata]) => {
    return firstMetadata.type === PropValueType.Object ? -1 : 1;
  });

  return sortedShape.map(([propName, propMetadata], index) => {
    const propVal = siteSettingsValues[propName];
    if (propVal.valueType !== PropValueType.Object) {
      return <SimplePropInput key={propName} propName={propName} propVal={propVal} updateValues={updateValues}/>
    }

    const shouldRenderDivider = index < sortedShape.length - 1;
    return <React.Fragment key={propName}>
      <div className="font-bold px-2 pb-2">{propName}</div>
      <RecursiveEditorGroup
        propName={propName}
        propVal={propVal}
        propMetadata={propMetadata as NestedPropMetadata}
        updateValues={updateValues}
      />
      {shouldRenderDivider && <hr className="bg-gray-300 h-0.5 rounded-md my-4" />}
    </React.Fragment>
  })
}

type SimpleProp = Exclude<LiteralProp<SiteSettingsValues>, ObjectProp<SiteSettingsValues>>

function SimplePropInput(props: {
  propVal: SimpleProp;
  updateValues: (propName: string, updatedProp: LiteralProp<SiteSettingsValues>) => void;
  propName: string;
}) {
  const { propVal, updateValues, propName } = props;
  const handleUpdate = useCallback((rawValue: SimpleProp["value"]) => {
    const updatedValue = {
      ...propVal,
      value: rawValue
    };
    if (!TypeGuards.isValidPropValue(updatedValue)) {
      console.error("Invalid PropVal when updating SiteSettings:", updatedValue);
      return null;
    }
    updateValues(propName, updatedValue);
  },
  [propName, updateValues]);

  return (
    <label className="flex h-10 items-center" id={propName} key={propName}>
      <span className="px-2">{propName}</span>
      <PropInput
        propType={propVal.valueType}
        currentPropValue={propVal.value}
        onChange={handleUpdate}
      />
    </label>
  );
}
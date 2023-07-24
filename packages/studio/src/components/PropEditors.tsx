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
import classNames from "classnames";
import ArrayPropEditor from "./ArrayPropEditor";
import UndefinedMenuButton from "./UndefinedMenuButton";

export default function PropEditors(props: {
  propShape: PropShape;
  propValues: PropValues;
  updateProps: (propValues: PropValues) => void;
  containers: string[];
  isNested?: boolean;
}) {
  const { propShape, propValues, updateProps, containers, isNested } = props;
  const updateSpecificProp = useCallback(
    (propName: string) => (propVal: PropVal | undefined) => {
      if (propVal === undefined) {
        const updatedPropValues = { ...propValues };
        delete updatedPropValues[propName];
        updateProps(updatedPropValues);
      } else {
        updateProps({
          ...propValues,
          [propName]: propVal,
        });
      }
    },
    [propValues, updateProps]
  );

  const numProps = Object.keys(propShape).length;
  const propEditors = Object.entries(propShape).map(
    ([propName, propMetadata], index) => {
      const editor = renderWrappedPropEditor(
        propName,
        propMetadata,
        propValues[propName],
        updateSpecificProp(propName),
        containers,
        isNested
      );
      if (isNested) {
        const isLastProp = index === numProps - 1;
        const classes = classNames("flex flex-row ml-2", {
          "border-l-2": !isLastProp,
        });
        return (
          <div className={classes} key={propName}>
            {isLastProp && (
              <div className="before:border-l-2 before:pt-1"></div>
            )}
            {editor}
          </div>
        );
      }
      return <div key={propName}>{editor}</div>;
    }
  );

  return <>{propEditors}</>;
}

function renderWrappedPropEditor(
  propName: string,
  propMetadata: PropMetadata,
  propVal: PropVal | undefined,
  updateProp: (propVal: PropVal | undefined) => void,
  containers: string[],
  isNested?: boolean
) {
  const editor = renderPropEditor(
    propName,
    propMetadata,
    propVal,
    updateProp,
    containers,
    isNested
  );
  if (propMetadata.required) {
    return editor;
  }
  return (
    <UndefinedMenuButton
      propType={propMetadata}
      isUndefined={!propVal}
      updateProp={updateProp}
    >
      {editor}
    </UndefinedMenuButton>
  );
}

export function renderPropEditor(
  propName: string,
  propMetadata: PropMetadata,
  propVal: PropVal | undefined,
  updateProp: (propVal: PropVal) => void,
  containers: string[],
  isNested?: boolean
) {
  if (propMetadata.type === PropValueType.Object) {
    if (propVal?.valueType && propVal.valueType !== PropValueType.Object) {
      console.error(
        `Mismatching propMetadata type ${propMetadata.type} for ${propName}.`
      );
      return null;
    }

    return (
      <NestedPropEditors
        propValues={propVal?.value}
        propType={propMetadata}
        propName={propName}
        updateProp={updateProp}
        containers={containers}
        isNested={isNested}
      />
    );
  } else if (propMetadata.type === PropValueType.Array) {
    if (propVal?.valueType && propVal.valueType !== PropValueType.Array) {
      console.error(
        `Mismatching propMetadata type ${propMetadata.type} for ${propName}.`
      );
      return null;
    }

    return (
      <ArrayPropEditor
        propName={propName}
        propMetadata={propMetadata}
        propValue={propVal?.value}
        onPropChange={updateProp}
        containers={containers}
        isNested={isNested}
      />
    );
  }

  const propKind = getPropKind(propMetadata);
  return (
    <PropEditor
      onPropChange={updateProp}
      propKind={propKind}
      propName={propName}
      propMetadata={propMetadata}
      propValue={PropValueHelpers.getPropValue(propVal, propKind)}
      containers={containers}
      isNested={isNested}
    />
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

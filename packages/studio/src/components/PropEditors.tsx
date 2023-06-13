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

export default function PropEditors(props: {
  propShape: PropShape;
  propValues: PropValues;
  updateProps: (propVal: PropValues) => void;
  isNested?: boolean;
}) {
  const { propShape, propValues, updateProps, isNested } = props;
  const updateSpecificProp = useCallback(
    (propName: string, propVal: PropVal) => {
      updateProps({
        ...propValues,
        [propName]: propVal,
      });
    },
    [propValues, updateProps]
  );

  const numProps = Object.keys(propShape).length;
  const propEditors = Object.entries(propShape).map(
    ([propName, propMetadata], index) => {
      const editor = renderPropEditor(
        propName,
        propMetadata,
        propValues,
        updateSpecificProp,
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

function renderPropEditor(
  propName: string,
  propMetadata: PropMetadata,
  propValues: PropValues,
  updateSpecificProp: (propName: string, propVal: PropVal) => void,
  isNested?: boolean
) {
  const propVal: PropVal | undefined = propValues[propName];

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
        updateSpecificProp={updateSpecificProp}
        isNested={isNested}
      />
    );
  }

  const propKind = getPropKind(propMetadata);
  return (
    <PropEditor
      onPropChange={updateSpecificProp}
      propKind={propKind}
      propName={propName}
      propMetadata={propMetadata}
      propValue={PropValueHelpers.getPropValue(propVal, propKind)}
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
  if (propMetadata.type === PropValueType.Array) {
    return PropValueKind.Expression;
  }

  return PropValueKind.Literal;
}

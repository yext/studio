import {
  StandardOrModuleComponentState,
  PropShape,
  PropVal,
  PropValueKind,
  PropMetadata,
  PropValueType,
} from "@yext/studio-plugin";
import { useCallback } from "react";
import useStudioStore from "../store/useStudioStore";
import createIsSupportedPropMetadata from "../utils/createIsSupportedPropMetadata";
import TemplateExpressionFormatter from "../utils/TemplateExpressionFormatter";
import PropEditor from "./PropEditor";

export default function PropEditors(props: {
  activeComponentState: StandardOrModuleComponentState;
  propShape: PropShape;
  getPropValueKind: (metadata: PropMetadata) => PropValueKind;
  shouldRenderProp?: (propMetadata: PropMetadata) => boolean;
}) {
  const updateActiveComponentProps = useStudioStore(
    (store) => store.actions.updateActiveComponentProps
  );
  const {
    activeComponentState,
    propShape,
    getPropValueKind,
    shouldRenderProp,
  } = props;

  const updateProps = useCallback(
    (propName: string, newPropVal: PropVal) => {
      updateActiveComponentProps({
        ...activeComponentState.props,
        [propName]: newPropVal,
      });
    },
    [updateActiveComponentProps, activeComponentState]
  );

  const editableProps = Object.entries(propShape)
    .filter(createIsSupportedPropMetadata(activeComponentState.componentName))
    .filter(([_, propMetadata]) => shouldRenderProp?.(propMetadata) ?? true);

  if (editableProps.length === 0) {
    return renderNoEditableProps(activeComponentState.componentName);
  }

  return (
    <>
      {editableProps.map(([propName, propMetadata]) => {
        const propKind = getPropValueKind(propMetadata);
        return (
          <PropEditor
            key={`${activeComponentState.uuid}-${propName}`}
            onPropChange={updateProps}
            propKind={propKind}
            propName={propName}
            propMetadata={propMetadata}
            propValue={getPropValue(
              activeComponentState.props[propName],
              propKind
            )}
          />
        );
      })}
    </>
  );
}

function getPropValue(
  propVal: PropVal | undefined,
  expectedPropKind: PropValueKind
): string | number | boolean | undefined {
  if (!propVal) {
    return undefined;
  }

  const { value, kind, valueType } = propVal;
  if (typeof value === "object") {
    throw new Error(
      `Unexpected object prop ${JSON.stringify(propVal, null, 2)}`
    );
  }

  if (
    expectedPropKind === PropValueKind.Expression &&
    TemplateExpressionFormatter.isNonTemplateStringExpression(propVal)
  ) {
    return TemplateExpressionFormatter.addBackticks("${" + value + "}");
  }

  const shouldConvertLiteralToExpression =
    expectedPropKind === PropValueKind.Expression &&
    kind === PropValueKind.Literal;
  if (shouldConvertLiteralToExpression && valueType === PropValueType.string) {
    return TemplateExpressionFormatter.addBackticks(value);
  }
  return value;
}

/**
 * Renders a styled, formatted message indicating the current Component has no editable props.
 *
 * @param componentName - The name of the current Component.
 */
function renderNoEditableProps(componentName: string) {
  return (
    <div className="text-sm bg-gray-100 p-4 border text-gray-500 rounded-lg text-center mb-2">
      {componentName} has no Editable Properties in this Panel.
    </div>
  );
}

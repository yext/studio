import {
  StandardOrModuleComponentState,
  PropShape,
  PropVal,
  PropValueKind,
  PropMetadata,
} from "@yext/studio-plugin";
import { useCallback } from "react";
import useStudioStore from "../store/useStudioStore";
import createIsSupportedPropMetadata from "../utils/createIsSupportedPropMetadata";
import PropEditor from "./PropEditor";
import PropValueHelpers from "../utils/PropValueHelpers";

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
            propValue={PropValueHelpers.getPropValue(
              activeComponentState.props[propName],
              propKind
            )}
          />
        );
      })}
    </>
  );
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

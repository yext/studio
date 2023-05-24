import {
  StandardOrModuleComponentState,
  PropShape,
  PropMetadata,
} from "@yext/studio-plugin";
import { useMemo } from "react";
import useStudioStore from "../store/useStudioStore";
import createIsSupportedPropMetadata from "../utils/createIsSupportedPropMetadata";
import PropEditors from "./PropEditors";

export default function ActiveComponentPropEditors(props: {
  activeComponentState: StandardOrModuleComponentState;
  propShape: PropShape;
  shouldRenderProp?: (propMetadata: PropMetadata) => boolean;
}) {
  const updateActiveComponentProps = useStudioStore(
    (store) => store.actions.updateActiveComponentProps
  );
  const { activeComponentState, propShape, shouldRenderProp } = props;

  const filteredPropShape: PropShape = useMemo(() => {
    const entries = Object.entries(propShape)
      .filter(createIsSupportedPropMetadata(activeComponentState.componentName))
      .filter(([_, propMetadata]) => shouldRenderProp?.(propMetadata) ?? true);
    return Object.fromEntries(entries);
  }, [activeComponentState.componentName, propShape, shouldRenderProp]);

  if (Object.keys(filteredPropShape).length === 0) {
    return renderNoEditableProps(activeComponentState.componentName);
  }

  const propValues = activeComponentState.props;
  return (
    <PropEditors
      propShape={filteredPropShape}
      propValues={propValues}
      updateProps={updateActiveComponentProps}
    />
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

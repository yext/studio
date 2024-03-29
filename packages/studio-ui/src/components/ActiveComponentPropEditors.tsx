import {
  PropShape,
  PropMetadata,
  StandardComponentState,
} from "@yext/studio-plugin";
import { useMemo } from "react";
import useStudioStore from "../store/useStudioStore";
import createIsSupportedPropMetadata from "../utils/createIsSupportedPropMetadata";
import PropEditors from "./PropEditors";
import MessageBubble from "./common/MessageBubble";

export default function ActiveComponentPropEditors(props: {
  activeComponentState: StandardComponentState;
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
    <div className="overflow-x-auto grow flex flex-col">
      <PropEditors
        propShape={filteredPropShape}
        propValues={propValues}
        updateProps={updateActiveComponentProps}
      />
    </div>
  );
}

/**
 * Renders a styled, formatted message indicating the current Component has no editable props.
 *
 * @param componentName - The name of the current Component.
 */
function renderNoEditableProps(componentName: string) {
  return (
    <MessageBubble
      message={`${componentName} has no Editable Properties in this Panel.`}
    />
  );
}

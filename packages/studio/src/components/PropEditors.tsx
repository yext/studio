import {
  PropMetadata,
  PropShape,
  PropVal,
  PropValueKind,
  StandardOrModuleComponentState,
} from "@yext/studio-plugin";
import { useCallback } from "react";
import useStudioStore from "../store/useStudioStore";
import createIsSupportedPropMetadata from "../utils/createIsSupportedPropMetadata";
import Callout from "./common/Callout";
import PropEditor from "./PropEditor";

export default function PropEditors(props: {
  activeComponentState: StandardOrModuleComponentState;
  propShape: PropShape;
  propKind: PropValueKind;
  shouldRenderProp?: (propMetadata: PropMetadata) => boolean;
}) {
  const updateActiveComponentProps = useStudioStore(
    (store) => store.actions.updateActiveComponentProps
  );

  const { activeComponentState, propShape, propKind, shouldRenderProp } = props;

  const updateProps = useCallback(
    (propName: string, newPropVal: PropVal) => {
      updateActiveComponentProps({
        ...activeComponentState.props,
        [propName]: newPropVal,
      });
    },
    [updateActiveComponentProps, activeComponentState]
  );

  const layerProps = Object.entries(propShape)
    .filter(createIsSupportedPropMetadata(activeComponentState.componentName))
    .filter(([_, propMetadata]) => shouldRenderProp?.(propMetadata) ?? true);
  return (
    <div className="border-b pb-4">
      {layerProps.length === 0 && (
        <Callout>
          {activeComponentState.componentName} doesn't have any editable
          properties
        </Callout>
      )}
      {layerProps.map(([propName, propMetadata]) => {
        const propValue = activeComponentState.props[propName]?.value as
          | string
          | number
          | boolean;

        return (
          <PropEditor
            key={propName}
            onPropChange={updateProps}
            propKind={propKind}
            {...{
              propName,
              propMetadata,
              propValue,
            }}
          />
        );
      })}
    </div>
  );
}

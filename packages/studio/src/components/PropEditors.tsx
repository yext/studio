import {
  StandardOrModuleComponentState,
  PropShape,
  PropVal,
  PropValueKind,
  PropMetadata,
} from "@yext/studio-plugin";
import { useCallback } from "react";
import useStudioStore from "../store/useStudioStore";
import createIsValidProp from "../utils/createIsValidProp";
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
  return (
    <>
      {Object.entries(propShape)
        .filter(createIsValidProp(activeComponentState))
        .map(([propName, propMetadata]) => {
          if (shouldRenderProp && !shouldRenderProp(propMetadata)) {
            return null;
          }
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
    </>
  );
}

import {
  PropVal,
  PropValueType,
  TypeGuards,
  PropMetadata,
  NestedPropMetadata,
  StandardOrModuleComponentState,
  PropShape,
  FileMetadataKind,
  ComponentStateKind,
} from "@yext/studio-plugin";
import useStudioStore from "../store/useStudioStore";
import { PropEditor } from "./PropEditor";
import Divider from "./common/Divider";
import { useCallback } from "react";
import useActiveComponent from "../hooks/useActiveComponent";
import ModuleActions from "./ModuleActions/ModuleActions";

/**
 * Renders prop editors for the active component selected by the user.
 */
export default function ComponentEditor(): JSX.Element | null {
  const { activeComponentMetadata, activeComponentState } =
    useActiveComponent();

  if (!activeComponentMetadata?.propShape) {
    return null;
  }

  if (
    !activeComponentState ||
    !TypeGuards.isStandardOrModuleComponentState(activeComponentState)
  ) {
    return null;
  }

  const isModule =
    activeComponentMetadata.kind === FileMetadataKind.Module &&
    activeComponentState.kind === ComponentStateKind.Module;

  return (
    <div>
      {isModule && (
        <ModuleActions
          metadata={activeComponentMetadata}
          moduleState={activeComponentState}
        />
      )}
      <PropEditors
        activeComponentState={activeComponentState}
        propShape={activeComponentMetadata.propShape}
      />
      <Divider />
    </div>
  );
}

function PropEditors(props: {
  activeComponentState: StandardOrModuleComponentState;
  propShape: PropShape;
}) {
  const updateActiveComponentProps = useStudioStore(
    (store) => store.actions.updateActiveComponentProps
  );
  const { activeComponentState, propShape } = props;

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
        .filter(
          (
            entry
          ): entry is [string, Exclude<PropMetadata, NestedPropMetadata>] => {
            const [propName, propMetadata] = entry;
            if (propMetadata.type === PropValueType.ReactNode) {
              // console.warn(
              //   `Found ${propName} in component ${activeComponentState.componentName} with PropValueType.ReactNode.` +
              //     " Studio does not support editing prop of type ReactNode."
              // );
              return false;
            }

            if (propMetadata.type === PropValueType.Object) {
              // console.warn(
              //   `Found ${propName} in component ${activeComponentState.componentName} with PropValueType.Object.` +
              //     " Studio does not support editing nested props."
              // );
              return false;
            }

            return true;
          }
        )
        .map(([propName, propMetadata], index) => {
          const currentPropValue = activeComponentState.props[propName]
            ?.value as string | number | boolean;
          const currentPropKind = activeComponentState.props[propName]?.kind;

          return (
            <PropEditor
              key={index}
              onPropChange={updateProps}
              {...{
                propName,
                propMetadata,
                currentPropValue,
                currentPropKind,
              }}
            />
          );
        })}
    </>
  );
}

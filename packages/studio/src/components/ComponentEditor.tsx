import {
  ComponentState,
  FileMetadata,
  PropVal,
  PropValueType,
  PropValues,
  TypeGuards,
  PropMetadata,
  NestedPropMetadata,
} from "@yext/studio-plugin";
import useStudioStore from "../store/useStudioStore";
import { PropEditor } from "./PropEditor";
import Divider from "./common/Divider";
import { useCallback } from "react";

/**
 * Renders prop editors for the active component selected by the user.
 */
export default function ComponentEditor(): JSX.Element | null {
  const {
    activeComponentMetadata,
    activeComponentState,
    setActiveComponentProps,
  } = useActiveComponent();

  const updateProps = useCallback(
    (propName: string, newPropVal: PropVal) => {
      if (
        !activeComponentState ||
        !TypeGuards.isStandardOrModuleComponentState(activeComponentState)
      ) {
        return null;
      }

      setActiveComponentProps({
        ...activeComponentState.props,
        [propName]: newPropVal,
      });
    },
    [setActiveComponentProps, activeComponentState]
  );

  if (!activeComponentMetadata?.propShape) {
    return null;
  }

  if (
    !activeComponentState ||
    !TypeGuards.isStandardOrModuleComponentState(activeComponentState)
  ) {
    return null;
  }

  return (
    <div>
      
      <Divider />
    </div>
  );
}

function PropEditors() {
  {Object.entries(activeComponentMetadata.propShape)
    .filter((entry): entry is [string, Exclude<PropMetadata, NestedPropMetadata>] => {
      const [propName, propMetadata] = entry;
      if (propMetadata.type === PropValueType.ReactNode) {
        console.warn(
          `Found ${propName} in component ${activeComponentState.componentName} with PropValueType.ReactNode.` +
            " Studio does not support editing prop of type ReactNode."
        );
        return false;
      }

      if (propMetadata.type === PropValueType.Object) {
        console.warn(
          `Found ${propName} in component ${activeComponentState.componentName} with PropValueType.Object.` +
            " Studio does not support editing prop of nested props."
        );
        return false;
      }

      return true;
    })
    .map(([propName, propMetadata], index) => {
      const currentPropValue = activeComponentState.props[propName]?.value as string | number | boolean;
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

}



function useActiveComponent(): {
  activeComponentMetadata?: FileMetadata;
  activeComponentState?: ComponentState;
  setActiveComponentProps: (props: PropValues) => void;
} {
  return useStudioStore((store) => {
    const activeComponentState = store.pages.getActiveComponentState();
    const activeComponentMetadata =
      activeComponentState &&
      TypeGuards.isStandardOrModuleComponentState(activeComponentState)
        ? store.fileMetadatas.getFileMetadata(activeComponentState.metadataUUID)
        : undefined;
    return {
      activeComponentMetadata,
      activeComponentState,
      setActiveComponentProps: store.pages.setActiveComponentProps,
    };
  });
}

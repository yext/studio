import {
  ComponentState,
  FileMetadata,
  PropVal,
  PropValueType,
  PropValues,
  TypeGuards,
} from "@yext/studio-plugin";
import useStudioStore from "../store/useStudioStore";
import { PropEditor } from "./PropEditor";
import Divider from "./common/Divider";

/**
 * Renders prop editors for the active component selected by the user.
 */
export default function ComponentEditor(): JSX.Element | null {
  const {
    activeComponentMetadata,
    activeComponentState,
    setActiveComponentProps,
  } = useActiveComponent();
  if (!activeComponentMetadata?.propShape) {
    return null;
  }
  if (
    !activeComponentState ||
    !TypeGuards.isStandardOrModuleComponentState(activeComponentState)
  ) {
    return null;
  }
  const { propShape, initialProps } = activeComponentMetadata;

  return (
    <div>
      {Object.entries(propShape)
        .filter(([propName, propMetadata]) => {
          if (propMetadata.type === PropValueType.ReactNode) {
            console.warn(
              `Found ${propName} in component ${activeComponentState.componentName} with PropValueType.ReactNode.` +
                " Studio does not support editing prop of type ReactNode."
            );
            return false;
          }
          return true;
        })
        .map(([propName, propMetadata], index) => {
          const currentPropValue = activeComponentState.props[propName]?.value;
          const currentPropKind = activeComponentState.props[propName]?.kind;
          const initialPropValue = initialProps?.[propName]?.value;
          const onPropChange = (newPropVal: PropVal) => {
            setActiveComponentProps({
              ...activeComponentState?.props,
              [propName]: newPropVal,
            });
          };
          return (
            <PropEditor
              key={index}
              {...{
                propName,
                propMetadata,
                initialPropValue,
                currentPropValue,
                currentPropKind,
                onPropChange,
              }}
            />
          );
        })}
      <Divider />
    </div>
  );
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

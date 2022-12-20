import {
  ComponentState,
  ComponentStateKind,
  PropVal,
  PropValueType,
  StandardOrModuleComponentState,
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
    !isStandardOrModuleComponentState(activeComponentState)
  ) {
    return null;
  }
  const { propShape, initialProps } = activeComponentMetadata;

  return (
    <div>
      {Object.entries(propShape)
        .filter(
          ([_propName, propMetadata]) =>
            propMetadata.type !== PropValueType.ReactNode
        )
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

function isStandardOrModuleComponentState(
  componentState: ComponentState
): componentState is StandardOrModuleComponentState {
  return (
    componentState.kind === ComponentStateKind.Module ||
    componentState.kind === ComponentStateKind.Standard
  );
}

function useActiveComponent() {
  return useStudioStore((store) => {
    const activeComponentState = store.pages.getActiveComponentState();
    const activeComponentMetadata =
      activeComponentState &&
      isStandardOrModuleComponentState(activeComponentState)
        ? store.fileMetadatas.getFileMetadata(activeComponentState.metadataUUID)
        : undefined;
    return {
      activeComponentMetadata,
      activeComponentState,
      setActiveComponentProps: store.pages.setActiveComponentProps,
    };
  });
}

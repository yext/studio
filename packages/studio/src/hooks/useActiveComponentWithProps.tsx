import {
  ComponentStateHelpers,
  FileMetadataKind,
  TypeGuards,
} from "@yext/studio-plugin";
import useActiveComponent from "./useActiveComponent";

export default function useActiveComponentWithProps() {
  const { activeComponentMetadata, activeComponentState } =
    useActiveComponent();

  if (
    activeComponentMetadata?.kind === FileMetadataKind.Error ||
    !activeComponentMetadata?.propShape
  ) {
    return null;
  }

  if (
    !activeComponentState ||
    !TypeGuards.isEditableComponentState(activeComponentState)
  ) {
    return null;
  }

  const extractedComponentState =
    ComponentStateHelpers.extractRepeatedState(activeComponentState);

  if (TypeGuards.isNonrecoverableError(extractedComponentState)) {
    return null;
  }

  return {
    activeComponentMetadata,
    propShape: activeComponentMetadata.propShape,
    activeComponentState,
    extractedComponentState,
  };
}

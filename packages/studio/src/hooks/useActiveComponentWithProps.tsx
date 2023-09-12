import { ComponentStateKind, FileMetadataKind } from "@yext/studio-plugin";
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
    activeComponentState.kind !== ComponentStateKind.Standard
  ) {
    return null;
  }

  return {
    activeComponentMetadata,
    propShape: activeComponentMetadata.propShape,
    activeComponentState,
  };
}

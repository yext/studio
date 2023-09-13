import { ComponentState, ComponentStateKind, FileMetadata, FileMetadataKind, PropShape } from "@yext/studio-plugin";
import useActiveComponent from "./useActiveComponent";

export default function useActiveComponentWithProps(): {
  activeComponentMetadata: FileMetadata,
  propShape: PropShape,
  activeComponentState: ComponentState,
} | null {
  const { activeComponentMetadata, activeComponentState } =
    useActiveComponent();

  if (
    activeComponentMetadata?.kind === FileMetadataKind.Error ||
    !activeComponentMetadata?.propShape
  ) {
    return null;
  }

  if (
    activeComponentState?.kind !== ComponentStateKind.Standard
  ) {
    return null;
  }

  return {
    activeComponentMetadata,
    propShape: activeComponentMetadata.propShape,
    activeComponentState,
  };
}

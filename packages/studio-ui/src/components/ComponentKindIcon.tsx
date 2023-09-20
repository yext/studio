import { ReactComponent as Box } from "../icons/box.svg";
import { ReactComponent as Container } from "../icons/container.svg";
import useStudioStore from "../store/useStudioStore";
import { ComponentState, ComponentStateKind } from "@yext/studio-plugin";

interface ComponentKindIconProps {
  componentState: ComponentState;
}

/**
 * Renders an SVG based on the {@link ComponentStateKind} of the node's {@link ComponentState}.
 */
export default function ComponentKindIcon(
  props: ComponentKindIconProps
): JSX.Element | null {
  const { componentState } = props;
  const getComponentMetadata = useStudioStore(
    (store) => store.fileMetadatas.getComponentMetadata
  );

  if (componentState.kind !== ComponentStateKind.Standard) {
    return null;
  }

  const { acceptsChildren } = getComponentMetadata(componentState.metadataUUID);
  if (acceptsChildren) {
    return <Container />;
  }
  return <Box />;
}

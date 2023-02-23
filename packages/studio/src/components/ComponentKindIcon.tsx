import { ComponentState, ComponentStateKind } from "@yext/studio-plugin";
import { ReactNode } from "react";
import { BsHexagonFill } from "react-icons/bs";
import { FaRegSquare } from "react-icons/fa";
import { HiOutlineSquares2X2 } from "react-icons/hi2";

import useStudioStore from "../store/useStudioStore";
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

  let icon: ReactNode | null = null;

  const { kind } = componentState;
  if (kind === ComponentStateKind.Module) {
    icon = <BsHexagonFill className="text-purple-700 rotate-90" />;
  } else if (kind === ComponentStateKind.Standard) {
    const { acceptsChildren } = getComponentMetadata(
      componentState.metadataUUID
    );
    if (acceptsChildren) {
      icon = <HiOutlineSquares2X2 />;
    } else {
      icon = <FaRegSquare />;
    }
  }
  return <div className=" text-gray-800">{icon}</div>;
}

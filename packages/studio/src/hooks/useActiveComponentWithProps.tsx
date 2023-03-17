import { TypeGuards } from "@yext/studio-plugin";
import useActiveComponent from "./useActiveComponent";

export default function useActiveComponentWithProps() {
  const { activeComponentMetadata, activeComponentState } =
    useActiveComponent();

  if (!activeComponentMetadata?.propShape) {
    return null;
  }

  if (
    !activeComponentState ||
    !(
      TypeGuards.isStandardOrModuleComponentState(activeComponentState) ||
      TypeGuards.isRepeaterState(activeComponentState)
    )
  ) {
    return null;
  }

  return {
    activeComponentMetadata,
    propShape: activeComponentMetadata.propShape,
    activeComponentState,
  };
}

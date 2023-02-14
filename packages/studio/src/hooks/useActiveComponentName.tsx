import { ComponentStateKind } from "@yext/studio-plugin";
import useStudioStore from "../store/useStudioStore";

export default function useActiveComponentName() {
  const getActiveComponentState = useStudioStore(
    (store) => store.actions.getActiveComponentState
  );
  const activeState = getActiveComponentState();
  if (!activeState) {
    return undefined;
  }
  if (activeState.kind === ComponentStateKind.Fragment) {
    return "Fragment";
  } else {
    return activeState.componentName;
  }
}

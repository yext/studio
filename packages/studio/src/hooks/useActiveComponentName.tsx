import { ComponentState, ComponentStateKind } from "@yext/studio-plugin";
import useStudioStore from "../store/useStudioStore";

export default function useActiveComponentName() {
  const getActiveComponentState = useStudioStore(
    (store) => store.actions.getActiveComponentState
  );
  const activeState = getActiveComponentState();
  if (!activeState) {
    return undefined;
  }
  getComponentName(activeState);
}

export function getComponentName(componentState: ComponentState) {
  if (componentState.kind === ComponentStateKind.Fragment) {
    return "Fragment";
  } else if (componentState.kind === ComponentStateKind.Repeater) {
    return `List (${componentState.repeatedComponent.componentName})`;
  } else {
    return componentState.componentName;
  }
}

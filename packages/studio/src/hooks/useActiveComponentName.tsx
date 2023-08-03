import {
  ComponentState,
  ComponentStateKind,
  TypeGuards,
} from "@yext/studio-plugin";
import useStudioStore from "../store/useStudioStore";

export default function useActiveComponentName(): string | undefined {
  const getActiveComponentState = useStudioStore(
    (store) => store.actions.getActiveComponentState
  );
  const activeState = getActiveComponentState();
  if (!activeState) {
    return undefined;
  }
  return getComponentDisplayName(activeState);
}

export function useComponentNames(uuids: string[]): (string | undefined)[] {
  const [getComponentTree, getComponentState] = useStudioStore((store) => {
    return [store.actions.getComponentTree, store.actions.getComponentState];
  });
  const componentStates = uuids.map((uuid) =>
    getComponentState(getComponentTree(), uuid)
  );
  return componentStates.map((state) =>
    state ? getComponentDisplayName(state) : undefined
  );
}

export function getComponentDisplayName(componentState: ComponentState) {
  if (componentState.kind === ComponentStateKind.Fragment) {
    return "Fragment";
  } else if (TypeGuards.isRepeaterState(componentState)) {
    return `List (${componentState.repeatedComponent.componentName})`;
  } else {
    return componentState.componentName;
  }
}

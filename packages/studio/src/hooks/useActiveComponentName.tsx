import {
  ComponentState,
  ComponentStateKind,
  ComponentTreeHelpers,
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

export function useComponentNames(
  uuids: Set<string>
): { name: string; uuid: string }[] {
  const componentTree = useStudioStore((store) => {
    return store.actions.getComponentTree();
  });
  if (!componentTree) {
    return [];
  }
  const componentStates = ComponentTreeHelpers.mapComponentTreeParentsFirst(
    componentTree,
    (c) => {
      if (uuids.has(c.uuid)) return c;
      else return undefined;
    }
  );
  return componentStates.flatMap((state) =>
    state ? { name: getComponentDisplayName(state), uuid: state.uuid } : []
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

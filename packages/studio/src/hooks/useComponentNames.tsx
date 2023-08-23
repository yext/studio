import { getComponentDisplayName } from "./useActiveComponentName";
import useStudioStore from "../store/useStudioStore";

export function useComponentNames(
  uuids: Set<string>
): { name: string; uuid: string }[] {
  const componentTree = useStudioStore((store) => {
    return store.actions.getComponentTree();
  });
  if (!componentTree) {
    return [];
  }
  const componentStates = componentTree.filter((c) => uuids.has(c.uuid));
  return componentStates
    .flatMap((state) => ({
      name: getComponentDisplayName(state),
      uuid: state.uuid,
    }));
}
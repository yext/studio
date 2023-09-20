import { useMemo } from "react";
import useStudioStore from "../store/useStudioStore";
import { ComponentState } from "@yext/studio-plugin";

/**
 * Load all functional component methods corresponding to the components
 * used in the provided page state's component tree.
 */
export default async function useImportedComponents(
  componentTree?: ComponentState[]
): Promise<void> {
  const importComponent = useStudioStore(
    (store) => store.actions.importComponent
  );

  return useMemo(async () => {
    if (!componentTree) {
      return;
    }
    await Promise.all(componentTree.map((c) => importComponent(c)));
  }, [componentTree, importComponent]);
}

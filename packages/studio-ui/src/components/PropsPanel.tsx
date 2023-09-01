import useActiveComponentWithProps from "../hooks/useActiveComponentWithProps";
import ActiveComponentPropEditors from "./ActiveComponentPropEditors";
import { ComponentStateKind } from "@yext/studio-plugin";
import ModuleActions from "./ModuleActions";
import RepeaterPanel from "./RepeaterPanel";
import Divider from "./common/Divider";

/**
 * Renders prop editors for the active component selected by the user.
 */
export default function PropsPanel(): JSX.Element | null {
  const activeComponentWithProps = useActiveComponentWithProps();
  if (!activeComponentWithProps) {
    return null;
  }
  const {
    activeComponentMetadata,
    activeComponentState,
    extractedComponentState,
    propShape,
  } = activeComponentWithProps;

  const isModule = extractedComponentState.kind === ComponentStateKind.Module;

  return (
    <>
      {isModule && (
        <>
          <ModuleActions
            state={activeComponentState}
            metadata={activeComponentMetadata}
          />
          <Divider />
        </>
      )}
      <ActiveComponentPropEditors
        activeComponentState={extractedComponentState}
        propShape={propShape}
      />
      <RepeaterPanel />
    </>
  );
}

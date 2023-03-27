import {
  ModuleState,
  ModuleMetadata,
  RepeaterState,
} from "@yext/studio-plugin";
import DeleteModuleButton from "./DeleteModuleButton";
import DetachModuleButton from "./DetachModuleButton";
import EditModuleButton from "./EditModuleButton";

/**
 * Displays a list of available actions for manipulating a Module.
 */
export default function ModuleEditActions({
  metadata,
  state,
}: {
  metadata: ModuleMetadata;
  state: ModuleState | RepeaterState;
}) {
  return (
    <>
      <EditModuleButton state={state} />
      <DetachModuleButton state={state} metadata={metadata} />
      <DeleteModuleButton metadata={metadata} />
    </>
  );
}

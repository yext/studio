import { ModuleMetadata, ModuleState } from "@yext/studio-plugin";
import DeleteModuleButton from "./DeleteModuleButton";
import DetachModuleButton from "./DetachModuleButton";
import EditModuleButton from "./EditModuleButton";

/**
 * Displays a list of available actions for manipulating a Module.
 */
export default function ModuleEditActions({
  metadata,
  moduleState,
}: {
  metadata: ModuleMetadata;
  moduleState: ModuleState;
}) {
  return (
    <>
      <EditModuleButton moduleState={moduleState} />
      <DetachModuleButton moduleState={moduleState} metadata={metadata} />
      <DeleteModuleButton metadata={metadata} />
    </>
  );
}

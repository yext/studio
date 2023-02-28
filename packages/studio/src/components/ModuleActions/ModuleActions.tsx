import { ModuleMetadata, ModuleState } from "@yext/studio-plugin";
import DeleteModuleButton from "./DeleteModuleButton";
import DetachModuleButton from "./DetachModuleButton";
import EditModuleButton from "./EditModuleButton";

/**
 * Displays a list of available actions for manipulating a Module when
 * it is the current active component.
 */
export default function ModuleActions({
  metadata,
  moduleState,
}: {
  metadata: ModuleMetadata;
  moduleState: ModuleState;
}) {

  return (
    <div className="flex px-2 mb-6">
      <span className="font-medium">Module Actions</span>
      <div className="flex grow justify-evenly">
          <EditModuleButton moduleState={moduleState} />
          <DetachModuleButton moduleState={moduleState} metadata={metadata} />
          <DeleteModuleButton metadata={metadata} />
      </div>
    </div>
  );
}

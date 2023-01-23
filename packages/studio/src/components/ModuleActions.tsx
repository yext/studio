import { ModuleMetadata } from "@yext/studio-plugin";
import DeleteModuleButton from "./DeleteModuleButton";

export default function ModuleActions({
  metadata,
}: {
  metadata: ModuleMetadata;
}) {
  return (
    <div className="flex px-2 mb-6">
      <span className="font-medium">Module Actions</span>
      <div className="flex grow justify-evenly">
        <DeleteModuleButton metadata={metadata} />
      </div>
    </div>
  );
}

import {
  FileMetadata,
  FileMetadataKind,
  TypeGuards,
  ComponentState,
} from "@yext/studio-plugin";
import ModuleEditActions from "./ModuleActions/ModuleEditActions";
import CreateModuleButton from "./ModuleActions/CreateModuleButton";

/**
 * Renders either a {@link CreateModuleButton} or the {@link ModuleEditActions}, depending
 * on if the active Component is already a Module or not.
 *
 * @param metadata - The {@link FileMetadata} of the active Component.
 * @param state - The {@link ComponentState} of the active Component.
 */
export default function ModuleActions(props: {
  metadata: FileMetadata;
  state: ComponentState;
}) {
  const { metadata, state } = props;
  const isModule =
    metadata.kind === FileMetadataKind.Module &&
    (TypeGuards.isModuleState(state) || TypeGuards.isRepeaterState(state));

  return (
    <div className="flex px-2 mb-6">
      <span className="font-medium">Module Actions</span>
      <div className="flex grow justify-evenly">
        {isModule ? (
          <ModuleEditActions metadata={metadata} state={state} />
        ) : (
          <CreateModuleButton />
        )}
      </div>
    </div>
  );
}

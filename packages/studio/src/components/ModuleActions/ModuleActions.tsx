import { ComponentStateKind, FileMetadataKind } from "@yext/studio-plugin";
import useActiveComponentWithProps from "../../hooks/useActiveComponentWithProps";
import SectionLabel from "../common/SectionLabel";
import CreateModuleButton from "./CreateModuleButton";
import DeleteModuleButton from "./DeleteModuleButton";
import DetachModuleButton from "./DetachModuleButton";
import EditModuleButton from "./EditModuleButton";

/**
 * Displays a list of available actions for manipulating a Module when
 * it is the current active component.
 */
export default function ModuleActions() {
  const activeComponentWithProps = useActiveComponentWithProps();
  if (!activeComponentWithProps) {
    return null;
  }
  const { activeComponentMetadata, activeComponentState } =
    activeComponentWithProps;

  const isModule =
    activeComponentMetadata.kind === FileMetadataKind.Module &&
    activeComponentState.kind === ComponentStateKind.Module;

  return (
    <div className="flex items-center gap-4 justify-between border-b mb-4 pb-4">
      <SectionLabel>Module Actions</SectionLabel>
      <div className="flex gap-2">
        {!isModule && (
          <>
            <CreateModuleButton />
          </>
        )}
        {isModule && (
          <>
            <EditModuleButton moduleState={activeComponentState} />
            <DetachModuleButton
              moduleState={activeComponentState}
              metadata={activeComponentMetadata}
            />
            <DeleteModuleButton metadata={activeComponentMetadata} />
          </>
        )}
      </div>
    </div>
  );
}

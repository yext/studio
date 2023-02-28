import {
  FileMetadataKind,
  ComponentStateKind,
  PropMetadata,
  PropValueType,
  PropValueKind,
  ComponentState,
  FileMetadata,
  ModuleMetadata,
  ModuleState
} from "@yext/studio-plugin";
import Divider from "./common/Divider";
import ModuleEditActions from "./ModuleActions/ModuleActions";
import PropEditors from "./PropEditors";
import useActiveComponentWithProps from "../hooks/useActiveComponentWithProps";
import CreateModuleButton from "./CreateModuleButton";

/**
 * Renders prop editors for the active component selected by the user.
 *
 * Filters props by {@link PropValueType} to only render non-strings.
 *
 * Interprets prop values as {@link PropValueKind.Literal}s.
 */
export default function PropertiesPanel(): JSX.Element | null {
  const activeComponentWithProps = useActiveComponentWithProps();
  if (!activeComponentWithProps) {
    return null;
  }
  const { activeComponentMetadata, activeComponentState, propShape } =
    activeComponentWithProps;

  return (
    <div>
      {renderModuleActions(activeComponentMetadata, activeComponentState)}
      <PropEditors
        activeComponentState={activeComponentState}
        propShape={propShape}
        propKind={PropValueKind.Literal}
        shouldRenderProp={shouldRenderProp}
      />
      <Divider />
    </div>
  );
}

function renderModuleActions(metadata?: FileMetadata, state?: ComponentState) {
  const isModule =
    metadata?.kind === FileMetadataKind.Module &&
    state?.kind === ComponentStateKind.Module;
  
  return (
    <div className="flex px-2 mb-6">
      <span className="font-medium">Module Actions</span>
      <div className="flex grow justify-evenly">
        {isModule
        ? <ModuleEditActions metadata={metadata} moduleState={state} /> : <CreateModuleButton />}
      </div>
    </div>
  );
}

function shouldRenderProp(metadata: PropMetadata) {
  return metadata.type !== PropValueType.string;
}

import {
  FileMetadataKind,
  PropMetadata,
  PropValueType,
  PropValueKind,
  ComponentState,
  FileMetadata,
  TypeGuards,
} from "@yext/studio-plugin";
import Divider from "./common/Divider";
import ModuleEditActions from "./ModuleActions/ModuleEditActions";
import PropEditors from "./PropEditors";
import useActiveComponentWithProps from "../hooks/useActiveComponentWithProps";
import CreateModuleButton from "./ModuleActions/CreateModuleButton";

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
  const {
    activeComponentMetadata,
    activeComponentState,
    extractedComponentState,
    propShape,
  } = activeComponentWithProps;

  return (
    <div>
      {renderModuleActions(activeComponentMetadata, activeComponentState)}
      <PropEditors
        activeComponentState={extractedComponentState}
        propShape={propShape}
        getPropValueKind={getPropValueKind}
        shouldRenderProp={shouldRenderProp}
      />
      <Divider />
    </div>
  );
}

/**
 * Renders either a {@link CreateModuleButton} or the {@link ModuleEditActions}, depending
 * on if the active Component is already a Module or not.
 *
 * @param metadata - The {@link FileMetadata} of the active Component.
 * @param state - The {@link ComponentState} of the active Component.
 */
function renderModuleActions(metadata: FileMetadata, state: ComponentState) {
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

function shouldRenderProp(metadata: PropMetadata) {
  return metadata.type !== PropValueType.string;
}

export function getPropValueKind(): PropValueKind {
  return PropValueKind.Literal;
}

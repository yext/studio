import {
  TypeGuards,
  FileMetadataKind,
  ComponentStateKind,
  PropMetadata,
  PropValueType,
  PropValueKind,
} from "@yext/studio-plugin";
import Divider from "./common/Divider";
import useActiveComponent from "../hooks/useActiveComponent";
import ModuleActions from "./ModuleActions/ModuleActions";
import PropEditors from "./PropEditors";

/**
 * Renders prop editors for the active component selected by the user.
 */
export default function PropertiesPanel(): JSX.Element | null {
  const { activeComponentMetadata, activeComponentState } =
    useActiveComponent();

  if (!activeComponentMetadata?.propShape) {
    return null;
  }

  if (
    !activeComponentState ||
    !TypeGuards.isStandardOrModuleComponentState(activeComponentState)
  ) {
    return null;
  }

  const isModule =
    activeComponentMetadata.kind === FileMetadataKind.Module &&
    activeComponentState.kind === ComponentStateKind.Module;

  return (
    <div>
      {isModule && (
        <ModuleActions
          metadata={activeComponentMetadata}
          moduleState={activeComponentState}
        />
      )}
      <PropEditors
        activeComponentState={activeComponentState}
        propShape={activeComponentMetadata.propShape}
        propKind={PropValueKind.Literal}
        shouldRenderProp={shouldRenderProp}
      />
      <Divider />
    </div>
  );
}

function shouldRenderProp(metadata: PropMetadata) {
  return metadata.type !== PropValueType.string;
}

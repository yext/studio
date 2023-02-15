import {
  FileMetadataKind,
  ComponentStateKind,
  PropMetadata,
  PropValueType,
  PropValueKind,
} from "@yext/studio-plugin";
import Divider from "./common/Divider";
import ModuleActions from "./ModuleActions/ModuleActions";
import PropEditors from "./PropEditors";
import useActiveComponentWithProps from "../hooks/useActiveComponentWithProps";

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
        propShape={propShape}
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

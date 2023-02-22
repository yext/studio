import {
  PropMetadata,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import useActiveComponentWithProps from "../hooks/useActiveComponentWithProps";
import ModuleActions from "./ModuleActions/ModuleActions";
import PropEditors from "./PropEditors";

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
    return (
      <div className="text-sm bg-gray-100 p-4 border text-gray-500 rounded-lg text-center">
        Select a layer to edit it's properties
      </div>
    );
  }
  const { activeComponentState, propShape } = activeComponentWithProps;

  return (
    <div>
      <ModuleActions />
      <PropEditors
        activeComponentState={activeComponentState}
        propShape={propShape}
        propKind={PropValueKind.Literal}
        shouldRenderProp={shouldRenderProp}
      />
    </div>
  );
}

function shouldRenderProp(metadata: PropMetadata) {
  return metadata.type !== PropValueType.string;
}

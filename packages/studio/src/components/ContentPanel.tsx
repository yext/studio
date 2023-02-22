import {
  PropMetadata,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import useActiveComponentWithProps from "../hooks/useActiveComponentWithProps";
import PropEditors from "./PropEditors";

/**
 * Renders prop editors for the active component selected by the user.
 *
 * Filters by {@link PropValueType} to only render strings.
 *
 * Interprets all prop values as {@link PropValueKind.Expression}s, even if
 * the value could be represented by a string literal.
 */
export default function ContentPanel(): JSX.Element | null {
  const activeComponentWithProps = useActiveComponentWithProps();
  if (!activeComponentWithProps) {
    return (
      <div className="text-sm bg-gray-100 p-4 border text-gray-500 rounded-lg text-center">
        Select a layer to edit it's content
      </div>
    );
  }
  const { activeComponentState, propShape } = activeComponentWithProps;

  return (
    <div>
      <PropEditors
        activeComponentState={activeComponentState}
        propShape={propShape}
        propKind={PropValueKind.Expression}
        shouldRenderProp={shouldRenderProp}
      />
    </div>
  );
}

function shouldRenderProp(metadata: PropMetadata) {
  return metadata.type === PropValueType.string;
}

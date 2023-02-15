import {
  PropValueKind,
  PropMetadata,
  PropValueType,
} from "@yext/studio-plugin";
import Divider from "./common/Divider";
import PropEditors from "./PropEditors";
import useActiveComponentWithProps from "../hooks/useActiveComponentWithProps";

/**
 * Renders prop editors for the active component selected by the user.
 */
export default function ContentPanel(): JSX.Element | null {
  const activeComponentWithProps = useActiveComponentWithProps();
  if (!activeComponentWithProps) {
    return null;
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
      <Divider />
    </div>
  );
}

function shouldRenderProp(metadata: PropMetadata) {
  return metadata.type === PropValueType.string;
}

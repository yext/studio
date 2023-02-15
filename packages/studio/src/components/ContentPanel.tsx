import {
  TypeGuards,
  PropValueKind,
  PropMetadata,
  PropValueType,
} from "@yext/studio-plugin";
import Divider from "./common/Divider";
import useActiveComponent from "../hooks/useActiveComponent";
import PropEditors from "./PropEditors";

/**
 * Renders prop editors for the active component selected by the user.
 */
export default function ContentPanel(): JSX.Element | null {
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

  return (
    <div>
      <PropEditors
        activeComponentState={activeComponentState}
        propShape={activeComponentMetadata.propShape}
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

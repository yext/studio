import {
  PropValueKind,
  PropMetadata,
  PropValueType,
  ComponentStateKind,
} from "@yext/studio-plugin";
import Divider from "./common/Divider";
import PropEditors from "./PropEditors";
import useActiveComponentWithProps from "../hooks/useActiveComponentWithProps";
import RepeaterEditor from "./RepeaterEditor";

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
    return null;
  }
  const { activeComponentState, propShape } = activeComponentWithProps;

  return (
    <div>
      <PropEditors
        activeComponentState={
          activeComponentState.kind === ComponentStateKind.Repeater
            ? activeComponentState.repeatedComponent
            : activeComponentState
        }
        propShape={propShape}
        propKind={PropValueKind.Expression}
        shouldRenderProp={shouldRenderProp}
      />
      <Divider />
      <RepeaterEditor componentState={activeComponentState} />
      <Divider />
    </div>
  );
}

function shouldRenderProp(metadata: PropMetadata) {
  return metadata.type === PropValueType.string;
}

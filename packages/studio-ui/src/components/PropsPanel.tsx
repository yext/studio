import useActiveComponentWithProps from "../hooks/useActiveComponentWithProps";
import ActiveComponentPropEditors from "./ActiveComponentPropEditors";

/**
 * Renders prop editors for the active component selected by the user.
 */
export default function PropsPanel(): JSX.Element | null {
  const activeComponentWithProps = useActiveComponentWithProps();
  if (!activeComponentWithProps) {
    return null;
  }
  const { activeComponentState, propShape } = activeComponentWithProps;

  return (
    <ActiveComponentPropEditors
      activeComponentState={activeComponentState}
      propShape={propShape}
    />
  );
}

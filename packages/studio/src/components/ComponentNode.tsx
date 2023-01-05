import { ComponentState, ComponentStateKind } from "@yext/studio-plugin";
import { ReactComponent as Vector } from "../icons/vector.svg";
import classNames from "classnames";
import ComponentKindIcon from "./ComponentKindIcon";
import { useCallback, useMemo } from "react";
import useStudioStore from "../store/useStudioStore";

interface ComponentNodeProps {
  /** The ComponentState this node represents in {@link ComponentTree}. */
  componentState: ComponentState;
  /** The depth of this node inside ComponentTree.*/
  depth: number;
  /** Whether this node's children are visible, if it has children. */
  isOpen: boolean;
  /** Toggle callback to open/close the node. */
  onToggle: (nodeId: string, newOpenValue: boolean) => void;
  /** Whether this node has children. */
  hasChild: boolean;
}

/**
 * ComponentNode is a single node in {@link ComponentTree}.
 */
export default function ComponentNode(props: ComponentNodeProps): JSX.Element {
  const { componentState, depth, isOpen, onToggle, hasChild } = props;
  const setActiveComponentUUID = useStudioStore(
    (store) => store.pages.setActiveComponentUUID
  );

  const text =
    componentState.kind === ComponentStateKind.Fragment
      ? "Fragment"
      : componentState.componentName;

  const vectorClassName = classNames("cursor-pointer", {
    "rotate-90": isOpen,
    invisible: !hasChild,
  });

  const handleClick = useCallback(() => {
    setActiveComponentUUID(componentState.uuid);
  }, [componentState.uuid, setActiveComponentUUID]);

  const componentNodeStyle = useMemo(
    () => ({ marginLeft: `${depth}em` }),
    [depth]
  );

  const handleToggle = useCallback(() => {
    onToggle(componentState.uuid, !isOpen);
  }, [componentState.uuid, isOpen, onToggle]);

  return (
    <div
      className="flex pl-2 items-center h-8 cursor-pointer hover:bg-gray-100"
      style={componentNodeStyle}
      onClick={handleClick}
    >
      <Vector className={vectorClassName} onClick={handleToggle} />
      <div className="pl-2">
        <ComponentKindIcon componentState={componentState} />
      </div>
      <span className="pl-1.5">{text}</span>
    </div>
  );
}

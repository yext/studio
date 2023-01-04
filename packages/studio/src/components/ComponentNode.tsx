import { ComponentState, ComponentStateKind } from "@yext/studio-plugin";
import { ReactComponent as Vector } from "../icons/vector.svg";
import classNames from "classnames";
import ComponentKindIcon from "./ComponentKindIcon";
import { useCallback, useMemo, useEffect } from "react";
import useStudioStore from "../store/useStudioStore";

interface ComponentNodeProps {
  /** The ComponentState this node represents in {@link ComponentTree}. */
  componentState: ComponentState;
  /** The depth of this node inside ComponentTree.*/
  depth: number;
  /** Whether this node's children are visible, if it has children. */
  isOpen: boolean;
  /** Toggle callback to open/close the node. */
  onToggle: () => void;
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

  // This addresses an issue with @minoru/react-dnd-treeview where sometimes new nodes do not
  // start off as open despite initialOpen being set to true in the Tree component.
  useEffect(() => {
    if (!isOpen && !hasChild) {
      onToggle();
    }
  }, [isOpen, hasChild, onToggle]);

  return (
    <div
      className="flex pl-2 items-center h-8 cursor-pointer hover:bg-gray-100"
      style={componentNodeStyle}
      onClick={handleClick}
    >
      <Vector className={vectorClassName} onClick={onToggle} />
      <div className="pl-2">
        <ComponentKindIcon componentState={componentState} />
      </div>
      <span className="pl-1.5">{text}</span>
    </div>
  );
}

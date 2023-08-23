import { Component, PropsWithChildren, ReactInstance } from "react";
import DOMRectProperties from "../store/models/DOMRectProperties";
import useStudioStore from "../store/useStudioStore";
import rectToJson from "../utils/rectToJson";
import { findDOMNode } from "react-dom";
import { isEqual } from "lodash";

/**
 * HighlightingContainer is intended to be used as a wrapper around a
 * single rendered Studio component.
 *
 * When this container is clicked, it sets its child component as the
 * current active component, and adds highlighting styling around it.
 */
export default function HighlightingContainer(
  props: PropsWithChildren<{ uuid: string }>
) {
  const [
    updateActiveComponent,
    activeComponentUUID,
    selectedComponentUUIDs,
    selectedComponentRectsMap,
    addSelectedComponentRect,
  ] = useStudioStore((store) => [
    store.pages.updateActiveComponent,
    store.pages.activeComponentUUID,
    store.pages.selectedComponentUUIDs,
    store.pages.selectedComponentRectsMap,
    store.pages.addSelectedComponentRect,
  ]);

  return (
    <HighlightingClass
      uuid={props.uuid}
      updateActiveComponent={updateActiveComponent}
      activeComponentUUID={activeComponentUUID}
      selectedComponentUUIDs={selectedComponentUUIDs}
      selectedComponentRectsMap={selectedComponentRectsMap}
      addSelectedComponentRect={addSelectedComponentRect}
    >
      {props.children}
    </HighlightingClass>
  );
}

type HighlightingProps = PropsWithChildren<{
  uuid: string;
  activeComponentUUID?: string;
  updateActiveComponent: (uuid: string) => void;
  selectedComponentUUIDs: Set<string>;
  selectedComponentRectsMap: Record<string, DOMRectProperties>;
  addSelectedComponentRect: (
    selectedUUID: string,
    rect: DOMRectProperties
  ) => void;
}>;

class HighlightingClass extends Component<HighlightingProps> {
  private resizeObserver: ResizeObserver;

  constructor(props: HighlightingProps) {
    super(props);
    this.resizeObserver = new ResizeObserver(() => {
      if (this.props.selectedComponentUUIDs.has(this.props.uuid)) {
        this.componentDidUpdate();
      }
    });
  }

  handleClick = (e?: Event) => {
    e?.stopImmediatePropagation();
    e?.preventDefault();
    const childNode = getDOMNode(this);
    if (!childNode) {
      return;
    }
    this.setSelfAsActive();
    this.highlightSelf(childNode);
  };

  highlightSelf = (childNode: Element) => {
    const rect = rectToJson(childNode.getBoundingClientRect());
    const isRectUpdated = !isEqual(
      this.props.selectedComponentRectsMap[this.props.uuid],
      rect
    );
    if (
      isRectUpdated &&
      this.props.selectedComponentUUIDs.has(this.props.uuid)
    ) {
      this.props.addSelectedComponentRect(this.props.uuid, rect);
    }
  };

  setSelfAsActive(): void {
    if (this.props.activeComponentUUID !== this.props.uuid) {
      this.props.updateActiveComponent(this.props.uuid);
    }
  }

  private attachListenerToChild() {
    const childNode = getDOMNode(this);
    if (!childNode) {
      return;
    }
    childNode.addEventListener("click", this.handleClick);
    this.resizeObserver.observe(document.body);
  }

  componentDidMount(): void {
    this.attachListenerToChild();
  }

  componentDidUpdate(): void {
    const childNode = getDOMNode(this);
    if (!childNode) {
      return;
    }
    if (this.props.selectedComponentUUIDs.has(this.props.uuid)) {
      this.highlightSelf(childNode);
    }
    this.attachListenerToChild();
  }

  componentWillUnmount(): void {
    const childNode = getDOMNode(this);
    if (!childNode) {
      return;
    }
    childNode.removeEventListener("click", this.handleClick);
    this.resizeObserver.disconnect();
  }

  render() {
    return <>{this.props.children}</>;
  }
}

/**
 * getDOMNode is a wrapper around findDOMNode.
 *
 * It uses process of elimnation to check that the return type is an
 * instanceof Element instead of directly checking for instanceof Element.
 * This is necessary due to issues with instanceof within an iframed react portal.
 */
function getDOMNode(instance: ReactInstance): Element | null {
  const childNode = findDOMNode(instance);
  if (!childNode || childNode instanceof Text) {
    return null;
  }
  return childNode;
}

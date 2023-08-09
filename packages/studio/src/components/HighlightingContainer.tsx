import { Component, PropsWithChildren, ReactInstance } from "react";
import DOMRectProperties from "../store/models/DOMRectProperties";
import useStudioStore from "../store/useStudioStore";
import rectToJson from "../utils/rectToJson";
import { findDOMNode } from "react-dom";

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
    setActiveUUID,
    activeComponentUUID,
    selectedComponentUUIDs,
    selectedComponentRects,
    addSelectedComponentUUID,
    addSelectedComponentRect,
    clearSelectedComponents,
  ] = useStudioStore((store) => [
    store.pages.setActiveComponentUUID,
    store.pages.activeComponentUUID,
    store.pages.selectedComponentUUIDs,
    store.pages.selectedComponentRects,
    store.pages.addSelectedComponentUUID,
    store.pages.addSelectedComponentRect,
    store.pages.clearSelectedComponents,
  ]);

  return (
    <HighlightingClass
      uuid={props.uuid}
      setActiveUUID={setActiveUUID}
      activeComponentUUID={activeComponentUUID}
      selectedComponentUUIDs={selectedComponentUUIDs}
      selectedComponentRects={selectedComponentRects}
      addSelectedComponentUUID={addSelectedComponentUUID}
      addSelectedComponentRect={addSelectedComponentRect}
      clearSelectedComponents={clearSelectedComponents}
    >
      {props.children}
    </HighlightingClass>
  );
}

type HighlightingProps = PropsWithChildren<{
  uuid: string;
  activeComponentUUID?: string;
  setActiveUUID: (uuid: string) => void;
  selectedComponentUUIDs: string[];
  selectedComponentRects: DOMRectProperties[];
  addSelectedComponentUUID: (componentUUID: string) => void;
  addSelectedComponentRect: (rect: DOMRectProperties) => void;
  clearSelectedComponents: () => void;
}>;

class HighlightingClass extends Component<HighlightingProps> {
  private resizeObserver: ResizeObserver;

  constructor(props: HighlightingProps) {
    super(props);
    this.resizeObserver = new ResizeObserver(() => {
      if (this.props.uuid === this.props.activeComponentUUID) {
        this.highlightSelf();
      }
    });
  }

  highlightSelf = (e?: Event) => {
    e?.stopImmediatePropagation();
    e?.preventDefault();
    const childNode = getDOMNode(this);
    if (!childNode) {
      return;
    }
    const rect = rectToJson(childNode.getBoundingClientRect());
    if (this.props.activeComponentUUID !== this.props.uuid) {
      this.props.setActiveUUID(this.props.uuid);
      this.props.clearSelectedComponents();
      this.props.addSelectedComponentUUID(this.props.uuid);
      this.props.addSelectedComponentRect(rect);
    }
  };

  private attachListenerToChild() {
    const childNode = getDOMNode(this);
    if (!childNode) {
      return;
    }
    childNode.addEventListener("click", this.highlightSelf);
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
    const rect = rectToJson(childNode.getBoundingClientRect());
    const isRectAdded = this.props.selectedComponentRects.some(
      (r) => JSON.stringify(r) === JSON.stringify(rect)
    );
    if (
      this.props.selectedComponentUUIDs.includes(this.props.uuid) &&
      !isRectAdded
    ) {
      this.props.addSelectedComponentRect(rect);
    }
    this.attachListenerToChild();
    if (this.props.uuid === this.props.activeComponentUUID) {
      this.highlightSelf();
    }
  }

  componentWillUnmount(): void {
    const childNode = getDOMNode(this);
    if (!childNode) {
      return;
    }
    childNode.removeEventListener("click", this.highlightSelf);
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

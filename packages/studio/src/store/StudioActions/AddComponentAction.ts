import {
  ComponentState,
  TypeGuards,
  ValidFileMetadata,
} from "@yext/studio-plugin";
import StudioActions from "../StudioActions";

export default class AddComponentAction {
  constructor(private studioActions: StudioActions) {}

  /**
   * Adds the component to the current active component tree.
   */
  addComponent = (metadata: ValidFileMetadata) => {
    const componentState = this.studioActions.createComponentState(metadata);
    return this.insertComponentState(componentState);
  };

  /**
   * Inserts the given compomnent state into the tree.
   * Tries to insert as a child of the active component, if possible.
   */
  private insertComponentState = (componentState: ComponentState) => {
    const activeComponentState = this.studioActions.getActiveComponentState();
    const activeComponentMetadata =
      this.studioActions.getComponentMetadata(activeComponentState);
    const activeComponentAcceptsChildren = TypeGuards.canAcceptChildren(
      activeComponentState,
      activeComponentMetadata
    );
    const updatedComponentState = {
      ...componentState,
      parentUUID: activeComponentAcceptsChildren
        ? activeComponentState?.uuid
        : activeComponentState?.parentUUID,
    };
    const tree = this.studioActions.getComponentTree();
    if (!tree) {
      return;
    }
    const activeComponentIndex = tree.findIndex(
      (c) => c.uuid === activeComponentState?.uuid
    );
    const insertionIndex = activeComponentAcceptsChildren
      ? 0
      : activeComponentIndex + 1;
    const updatedTree = [...tree];
    updatedTree.splice(insertionIndex, 0, updatedComponentState);
    return this.studioActions.updateComponentTree(updatedTree);
  };
}

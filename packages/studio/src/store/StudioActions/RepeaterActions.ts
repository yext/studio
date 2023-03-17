import {
  ComponentStateKind,
  EditableComponentState,
  RepeaterState,
  TypeGuards,
} from "@yext/studio-plugin";
import StudioActions from "../StudioActions";

export default class RepeaterActions {
  constructor(private studioActions: StudioActions) {}

  /**
   * Turns the standard component or module into a repeater.
   */
  addRepeater = (componentState: EditableComponentState) => {
    if (!TypeGuards.isStandardOrModuleComponentState(componentState)) {
      throw new Error(
        "Error in addRepeater: Only components and modules can be repeated."
      );
    }
    const newComponentState: RepeaterState = {
      kind: ComponentStateKind.Repeater,
      uuid: componentState.uuid,
      parentUUID: componentState.parentUUID,
      repeatedComponent: componentState,
      listExpression: "",
    };
    this.studioActions.replaceComponentState(
      componentState.uuid,
      newComponentState
    );
  };

  /**
   * Turns the repeater component back into a regular component or module.
   */
  removeRepeater = (componentState: EditableComponentState) => {
    if (!TypeGuards.isRepeaterState(componentState)) {
      throw new Error("Error in removeRepeater: Component is not a Repeater.");
    }
    const newComponentState = {
      ...componentState.repeatedComponent,
      uuid: componentState.uuid,
      parentUUID: componentState.parentUUID,
    };
    this.studioActions.replaceComponentState(
      componentState.uuid,
      newComponentState
    );
  };
}

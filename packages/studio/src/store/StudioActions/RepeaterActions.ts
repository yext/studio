import {
  ComponentStateKind,
  RepeaterState,
  StandardOrModuleComponentState,
} from "@yext/studio-plugin";
import StudioActions from "../StudioActions";

export default class RepeaterActions {
  constructor(private studioActions: StudioActions) {}

  /**
   * Turns the standard component or module into a repeater.
   */
  addRepeater = (componentState: StandardOrModuleComponentState) => {
    const { uuid, parentUUID, ...remainingComponentState } = componentState;
    const newComponentState: RepeaterState = {
      kind: ComponentStateKind.Repeater,
      uuid,
      parentUUID,
      repeatedComponent: remainingComponentState,
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
  removeRepeater = (componentState: RepeaterState) => {
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

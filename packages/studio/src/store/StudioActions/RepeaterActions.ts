import {
  ComponentState,
  ComponentStateKind,
  RepeaterState,
  TypeGuards,
} from "@yext/studio-plugin";
import StudioActions from "../StudioActions";

export default class RepeaterActions {
  constructor(private studioActions: StudioActions) {}

  /**
   * Turns the standard component or module into a repeater.
   */
  addRepeater = (componentUUID: string) => {
    const createNewComponentState = (c: ComponentState) => {
      if (!TypeGuards.isStandardOrModuleComponentState(c)) {
        throw new Error(
          "Error in addRepeater: Only components and modules can be repeated."
        );
      }
      const repeaterState: RepeaterState = {
        kind: ComponentStateKind.Repeater,
        uuid: c.uuid,
        parentUUID: c.parentUUID,
        repeatedComponent: c,
        listExpression: "",
      };
      return repeaterState;
    };
    this.studioActions.replaceComponentState(
      componentUUID,
      createNewComponentState
    );
  };

  /**
   * Turns the repeater component back into a regular component or module.
   */
  removeRepeater = (componentUUID: string) => {
    const createNewComponentState = (c: ComponentState) => {
      if (c.kind !== ComponentStateKind.Repeater) {
        throw new Error(
          "Error in removeRepeater: Component is not a Repeater."
        );
      }
      return {
        ...c.repeatedComponent,
        uuid: c.uuid,
        parentUUID: c.parentUUID,
      };
    };
    this.studioActions.replaceComponentState(
      componentUUID,
      createNewComponentState
    );
  };
}

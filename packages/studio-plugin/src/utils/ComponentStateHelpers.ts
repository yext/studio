import {
  EditableComponentState,
  StandardOrModuleComponentState,
} from "../types";
import TypeGuards from "./TypeGuards";

/**
 * A static class for housing various util functions related to the component
 * state used by Studio.
 */
export default class ComponentStateHelpers {
  /**
   * Extracts the state for a regular component or module from any kind of
   * editable component state.
   */
  static extractStandardOrModuleComponentState(
    c: EditableComponentState
  ): StandardOrModuleComponentState {
    return TypeGuards.isStandardOrModuleComponentState(c)
      ? c
      : {
          ...c.repeatedComponent,
          uuid: c.uuid,
          parentUUID: c.parentUUID,
        };
  }
}

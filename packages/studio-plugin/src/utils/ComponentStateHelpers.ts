import { ComponentState, ErrorComponentState, RepeaterState } from "../types";
import TypeGuards from "./TypeGuards";

/**
 * A static class for housing various util functions related to the component
 * state used by Studio.
 */
export default class ComponentStateHelpers {
  static extractRepeatedState<T extends Exclude<ComponentState, RepeaterState>>(
    c: T | RepeaterState
  ): T | ErrorComponentState {
    if (TypeGuards.isRepeaterState(c)) {
      const repeatedState = {
        ...c.repeatedComponent,
        uuid: c.uuid,
        parentUUID: c.parentUUID,
      } as T | ErrorComponentState;
      return repeatedState;
    }
    return c;
  }
}

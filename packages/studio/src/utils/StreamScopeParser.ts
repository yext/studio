import { StreamScope } from "@yext/studio-plugin";

/**
 * The values in each stream scope filter are
 * separated by commas in a string to display to the user.
 */
export type StreamScopeForm = {
  [key in keyof StreamScope]: string;
};

const defaultStreamScopeDisplay : Required<StreamScopeForm> = {
  entityIds: "",
  entityTypes: "",
  savedFilterIds: "",
}

export default class StreamScopeParser {
  /**
   * Generates a StreamScope object from the user input
   * in a StreamScopeForm object.
   */
  static parseStreamScope(form: StreamScopeForm): StreamScope {
    const newStreamScope = Object.entries(form).reduce((scope, [key, val]) => {
      const values = val
        ? val
            .split(",")
            .map((str) => str.trim())
            .filter((str) => str)
        : [];
      if (values.length > 0 && key in defaultStreamScopeDisplay) {
        scope[key] = values;
      }
      return scope;
    }, {} as StreamScope);
    return newStreamScope;
  }

  /**
   * Generates a StreamScopeForm to display to the user from the StreamScope object.
   */
  static displayStreamScope(scope: StreamScope): Required<StreamScopeForm> {
    const newStreamScopeForm : Required<StreamScopeForm> = Object.entries(scope).reduce((form, [key, val]) => {
      form[key] = val.join(",");
      return form;
    }, {...defaultStreamScopeDisplay});
    return newStreamScopeForm;
  }
}

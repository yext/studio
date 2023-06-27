import { StreamScope } from "@yext/studio-plugin";

/**
 * The values in each stream scope filter are
 * separated by commas in a string to display to the user
 */
export type StreamScopeForm = {
  [key in keyof StreamScope]: string;
};

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
      if (values.length > 0 && key !== "url") {
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
    return {
      entityIds: scope.entityIds?.join(",") ?? "",
      entityTypes: scope.entityTypes?.join(",") ?? "",
      savedFilterIds: scope.savedFilterIds?.join(",") ?? "",
    };
  }
}

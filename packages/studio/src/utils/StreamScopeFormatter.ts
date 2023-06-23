import { StreamScope } from "@yext/studio-plugin";

export type StreamScopeForm = {
    [key in keyof StreamScope]: string;
};
/**
 * Generates a StreamScope object from the user input
 * in a StreamScopeForm object
 */
export default class StreamScopeFormatter {
    static readStreamScope(form: StreamScopeForm) : StreamScope {
        const newStreamScope = Object.entries(form).reduce((scope, [key, val]) => {
          const values = val ? val
            .split(",")
            .map((str) => str.trim())
            .filter((str) => str) : [];
            if (values.length > 0 && key !== "url") {
            scope[key] = values;
          }
          return scope;
        }, {} as StreamScope);
        return newStreamScope;
      }
}
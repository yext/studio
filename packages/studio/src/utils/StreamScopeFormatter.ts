import { StreamScope } from "@yext/studio-plugin";

export type StreamScopeForm = {
    [key in keyof StreamScope]: string;
};
export default class StreamScopeFormatter {
    /**
     * Generates a StreamScope object from the user input
     * in a StreamScopeForm object
     */
    static readStreamScope(form: StreamScopeForm): StreamScope {
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
    /**
     * Generates a string of values separated by commas to display to the user for a property 
     * (entityIds, entityTypes, savedFilterIds) in the StreamScope object
     */
    static displayStreamScopeField(values: string[] | undefined): string {
        return values ? values.join(",") : "";
    }
}
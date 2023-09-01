import { FunctionComponent } from "react";

/**
 * Describe the import shape of a Studio's React source file
 * (e.g. Module, Component, and Page).
 */
export type ImportType = FunctionComponent<Record<string, unknown>>;

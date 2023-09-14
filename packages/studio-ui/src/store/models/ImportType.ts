import { FunctionComponent } from "react";

/**
 * Describe the import shape of a Studio's React source file
 * (e.g. Component or Page).
 */
export type ImportType = FunctionComponent<Record<string, unknown>>;

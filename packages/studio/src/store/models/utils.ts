import { FunctionComponent } from "react";
import { StateCreator } from "zustand";

/**
 * A type wrapper to Zustand's StateCreator with predefined middlewares
 * mutator typings applied to Studio store.
 */
export type SliceCreator<T> = StateCreator<T, [["zustand/immer", never]]>;

/**
 * Describe the import shape of a Studio's React source file
 * (e.g. Module, Component, and Page).
 */
export type ImportType = FunctionComponent<Record<string, unknown>>;

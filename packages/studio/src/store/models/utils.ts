import { StateCreator } from "zustand";

/**
 * A type wrapper to Zustand's StateCreator with predefined middlewares
 * mutator typings applied to Studio store.
 */
export type SliceCreator<T> = StateCreator<T, [["zustand/immer", never]]>;

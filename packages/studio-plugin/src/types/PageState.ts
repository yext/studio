import { Stream } from "@yext/pages";
import { PropValueKind } from "./PropValues";
import { LayoutMetadata } from "./LayoutMetadata";

export type PageState = LayoutMetadata & {
  pagesJS?: PagesJsState;
};

/** The PagesJS-related information for a page. */
export type PagesJsState = {
  /**
   * An array of names of entity files for this page.
   * e.g. ["locations__7f93c5160594d864417cee454f073ef3.json"]
   */
  entityFiles?: string[];
  /**
   * Return value of the getPath function if it returns a single, top-level,
   * string literal or expression.
   */
  getPathValue: GetPathVal | undefined;
  /** The scope for the stream in an entity template. */
  streamScope?: StreamScope;
};

export type GetPathVal = {
  kind: PropValueKind;
  value: string;
};

export type StreamScope = Stream["filter"];

export type ErrorPageState = {
  message: string;
};

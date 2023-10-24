export default interface LoadedStylesSlice {
  loadedStyles: Set<string>;
  addLoadedStyle: (style: string) => void;
}

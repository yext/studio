export default interface LoadedStylesSlice {
  loadedStyleFilepaths: Set<string>;
  addLoadedStyleFilepath: (style: string) => void;
}

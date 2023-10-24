export default interface LoadingProgressSlice {
  loadedStyles: Set<string>;
  addLoadedStyle: (style: string) => void;
}

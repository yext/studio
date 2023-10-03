export default interface CssSlice {
  importerToCssMap: Record<string, Set<string>>;
  setImporterToCssMap(importerToCssMap: Record<string, string[]>);
}

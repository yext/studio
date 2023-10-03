export default interface CssSlice {
  cssToImporterMap: Record<string, Set<string>>;
  setCssToImporterMap(id: string, importersSet: string[]);
}

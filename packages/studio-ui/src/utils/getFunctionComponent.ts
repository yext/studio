import { ImportType } from '../store/models/ImportType';

export default function getFunctionComponent(
  importedValue: Record<string, unknown>
): ImportType | undefined {
  return importedValue["default"] as ImportType | undefined;
}

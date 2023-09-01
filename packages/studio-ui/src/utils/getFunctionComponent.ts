import { FunctionComponent } from "react";
import { ImportType } from "../store/models/ImportType";

export default function getFunctionComponent(
  importedValue: Record<string, unknown>,
  name: string
): ImportType | undefined {
  if (typeof importedValue[name] === "function") {
    return importedValue[name] as FunctionComponent;
  } else if (typeof importedValue["default"] === "function") {
    return importedValue["default"] as FunctionComponent;
  } else {
    console.error(`${name} is not a valid functional component.`);
  }
}

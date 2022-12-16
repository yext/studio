import {
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
  SyntaxKind,
} from "ts-morph";
import { PropVal, PropValueKind, PropValueType } from "../../types";

import StaticParsingHelpers from "./StaticParsingHelpers";

type PrimitivePropValueType =
  | PropValueType.number
  | PropValueType.string
  | PropValueType.boolean;

/**
 * A static class for housing various typeguards used by Studio.
 */
export default class TypeGuards {
  static isValidPropValue(propValue: {
    kind: PropValueKind;
    valueType: PropValueType;
    value: string | number | boolean;
  }): propValue is PropVal {
    const { kind, valueType, value } = propValue;
    if (kind === PropValueKind.Expression) {
      return typeof value === "string";
    }
    switch (valueType) {
      case PropValueType.string:
        return typeof value === "string";
      case PropValueType.boolean:
        return typeof value === "boolean";
      case PropValueType.number:
        return typeof value === "number";
      case PropValueType.HexColor:
        return typeof value === "string";
    }
    return false;
  }

  static isPrimitiveProp(
    propValueType: string
  ): propValueType is PrimitivePropValueType {
    return [
      PropValueType.boolean,
      PropValueType.string,
      PropValueType.number,
    ].includes(propValueType as PropValueType);
  }

  static isPropValueType(type: string): type is PropValueType {
    const propTypes = Object.values(PropValueType);
    return propTypes.includes(type as PropValueType);
  }

  static isTemplateString(value: unknown): value is `\`${string}\`` {
    return (
      typeof value == "string" &&
      value.startsWith("`") &&
      value.endsWith("`") &&
      value.length >= 2
    );
  }

  static isNotFragmentElement(
    element: JsxElement | JsxSelfClosingElement | JsxFragment
  ): element is JsxElement | JsxSelfClosingElement {
    if (element.isKind(SyntaxKind.JsxFragment)) {
      return false;
    }
    if (element.isKind(SyntaxKind.JsxSelfClosingElement)) {
      return true;
    }
    const name = StaticParsingHelpers.parseJsxElementName(element);
    return !["Fragment", "React.Fragment"].includes(name);
  }
}

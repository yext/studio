import {
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
  SyntaxKind,
} from "ts-morph";
import {
  ComponentState,
  ComponentStateKind,
  PropVal,
  PropValueKind,
  PropValues,
  PropValueType,
  SiteSettingsValues,
  StandardOrModuleComponentState,
  ObjectProp,
} from "../types";

import StaticParsingHelpers from "../parsers/helpers/StaticParsingHelpers";
import {
  SiteSettingsExpression,
  StreamsDataExpression,
  TemplateStringExpression,
} from "../types/Expression";

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
    value: unknown;
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
        return typeof value === "string" && value.startsWith("#");
      case PropValueType.Object:
        return (
          typeof value === "object" && !Array.isArray(value) && value !== null
        );
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

  static isTemplateString(value: unknown): value is TemplateStringExpression {
    return (
      typeof value == "string" &&
      value.startsWith("`") &&
      value.endsWith("`") &&
      value.length >= 2
    );
  }

  static isStreamsDataExpression(
    value: unknown
  ): value is StreamsDataExpression {
    return typeof value === "string" && value.startsWith("document.");
  }

  static isSiteSettingsExpression(
    value: unknown
  ): value is SiteSettingsExpression {
    return typeof value === "string" && value.startsWith("siteSettings.");
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

  static isStandardOrModuleComponentState(
    componentState: ComponentState
  ): componentState is StandardOrModuleComponentState {
    return (
      componentState.kind === ComponentStateKind.Module ||
      componentState.kind === ComponentStateKind.Standard
    );
  }

  static isSiteSettingsValues(
    propValues: PropValues
  ): propValues is SiteSettingsValues {
    for (const val of Object.values(propValues)) {
      if (val.kind === PropValueKind.Expression) {
        return false;
      }
      if (
        val.valueType === PropValueType.Object &&
        !TypeGuards.isSiteSettingsValues(val.value)
      ) {
        return false;
      }
    }
    return true;
  }
}

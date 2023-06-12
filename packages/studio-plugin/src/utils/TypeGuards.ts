import {
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
  SyntaxKind,
} from "ts-morph";
import {
  ComponentState,
  ComponentStateKind,
  EditableComponentState,
  FileMetadata,
  FileMetadataKind,
  ModuleMetadata,
  ModuleState,
  PropShape,
  PropType,
  PropVal,
  PropValueKind,
  PropValues,
  PropValueType,
  RepeaterState,
  SiteSettingsShape,
  SiteSettingsValues,
  StandardOrModuleComponentState,
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
  static assertIsValidPropVal(propVal: {
    kind: PropValueKind;
    valueType: PropValueType;
    value: unknown;
  }): asserts propVal is PropVal {
    if (!this.isValidPropVal(propVal)) {
      throw new Error(
        "Invalid prop value: " + JSON.stringify(propVal, null, 2)
      );
    }
  }

  static isValidPropVal = (propVal: {
    kind: PropValueKind;
    valueType: PropValueType;
    value: unknown;
  }): propVal is PropVal => {
    const { kind, valueType, value } = propVal;
    if (kind === PropValueKind.Expression) {
      return this.valueMatchesPropType({ type: PropValueType.string }, value);
    }
    switch (valueType) {
      case PropValueType.string:
      case PropValueType.boolean:
      case PropValueType.number:
      case PropValueType.HexColor:
        return this.valueMatchesPropType({ type: valueType }, value);
      case PropValueType.Array:
        return Array.isArray(value) && value.every(this.isValidPropVal);
      case PropValueType.Object:
        const baseIsValid =
          typeof value === "object" && !Array.isArray(value) && value !== null;
        return (
          baseIsValid &&
          Object.values(value as PropValues).every(this.isValidPropVal)
        );
    }
    return false;
  };

  /** Checks that the value of a prop matches the prop type. */
  static valueMatchesPropType = (
    propType: PropType,
    value: unknown
  ): value is
    | string
    | number
    | boolean
    | unknown[]
    | Record<string, unknown> => {
    switch (propType.type) {
      case PropValueType.string:
        const unionValues = propType.unionValues;
        const isStringUnion = !!unionValues;
        return (
          typeof value === "string" &&
          (!isStringUnion || unionValues.includes(value))
        );
      case PropValueType.boolean:
        return typeof value === "boolean";
      case PropValueType.number:
        return typeof value === "number";
      case PropValueType.HexColor:
        return typeof value === "string" && value.startsWith("#");
      case PropValueType.Array:
        return (
          Array.isArray(value) &&
          value.every((val) =>
            this.valueMatchesPropType(propType.itemType, val)
          )
        );
      case PropValueType.Object:
        const baseIsValid =
          typeof value === "object" && !Array.isArray(value) && value !== null;
        return (
          baseIsValid &&
          Object.entries(propType.shape).every(([field, metadata]) =>
            value[field] !== undefined
              ? this.valueMatchesPropType(metadata, value[field])
              : !metadata.required
          )
        );
    }
    return false;
  };

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

  static isModuleMetadata(
    metadata?: FileMetadata | null
  ): metadata is ModuleMetadata {
    return metadata?.kind === FileMetadataKind.Module;
  }

  static isModuleState(
    componentState: ComponentState
  ): componentState is ModuleState {
    return componentState.kind === ComponentStateKind.Module;
  }

  static isStandardOrModuleComponentState(
    componentState: ComponentState
  ): componentState is StandardOrModuleComponentState {
    return (
      componentState.kind === ComponentStateKind.Module ||
      componentState.kind === ComponentStateKind.Standard
    );
  }

  static isRepeaterState(
    componentState: ComponentState
  ): componentState is RepeaterState {
    return componentState.kind === ComponentStateKind.Repeater;
  }

  static isEditableComponentState(
    componentState: ComponentState
  ): componentState is EditableComponentState {
    return (
      componentState.kind === ComponentStateKind.Module ||
      componentState.kind === ComponentStateKind.Standard ||
      componentState.kind === ComponentStateKind.Repeater
    );
  }

  static isSiteSettingsValues(
    propValues: PropValues
  ): propValues is SiteSettingsValues {
    for (const val of Object.values(propValues)) {
      if (val.kind === PropValueKind.Expression) {
        return false;
      }
      const isInvalidObject =
        val.valueType === PropValueType.Object &&
        !TypeGuards.isSiteSettingsValues(val.value);
      if (isInvalidObject) {
        return false;
      }
    }
    return true;
  }

  static isSiteSettingsShape(
    propShape: PropShape
  ): propShape is SiteSettingsShape {
    return Object.values(propShape).every(
      (metadata) => metadata.type !== PropValueType.ReactNode
    );
  }

  static canAcceptChildren(
    state?: ComponentState,
    metadata?: FileMetadata
  ): boolean {
    return (
      (metadata && "acceptsChildren" in metadata && metadata.acceptsChildren) ||
      state?.kind === ComponentStateKind.Fragment ||
      state?.kind === ComponentStateKind.BuiltIn
    );
  }
}

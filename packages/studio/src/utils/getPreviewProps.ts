import {
  PropValueType,
  PropValueKind,
  TypeGuards,
  TEMPLATE_STRING_EXPRESSION_REGEX,
  PropValues,
  PropShape,
  transformPropValuesToRaw,
  PropVal,
  ExpressionProp,
} from "@yext/studio-plugin";
import { get } from "lodash";
import TemplateExpressionFormatter from "./TemplateExpressionFormatter";
import PropValueHelpers from "./PropValueHelpers";

/**
 * Transform props' values based on PropValueKind. If a prop's value is of
 * type expression, the expression string is replaced with the actual value
 * derived from the expression source.
 *
 * @param props - the props to transform.
 * @param propShape - the shape of the component's props
 * @param expressionSources - a map of expression source to its field names and values.
 * @returns - a map of prop's name to its transformed value.
 */
export function getPreviewProps(
  props: PropValues,
  propShape: PropShape,
  expressionSources: ExpressionSources
): Record<string, unknown> {
  const transformedProps: Record<string, unknown> = {};
  Object.keys(propShape).forEach((propName) => {
    if (!props[propName] && propShape[propName].type === PropValueType.Object) {
      return undefined;
    }

    if (!props[propName]) {
      transformedProps[propName] = PropValueHelpers.getPropTypeDefaultValue(
        propShape[propName].type,
        PropValueKind.Literal
      );
      return;
    }
    const propVal = props[propName];
    if (propVal.kind === PropValueKind.Expression) {
      transformedProps[propName] = getExpressionPropLiteralValue(
        propVal,
        expressionSources
      );
    } else if (propVal.valueType === PropValueType.Object) {
      transformedProps[propName] = transformPropValuesToRaw(propVal.value);
    } else {
      transformedProps[propName] = propVal.value;
    }
  });
  return transformedProps;
}

/**
 * Calculates the underlying literal value for an {@link ExpressionProp}.
 */
function getExpressionPropLiteralValue(
  { value, valueType }: ExpressionProp,
  expressionSources: ExpressionSources
) {
  if (TypeGuards.isTemplateString(value)) {
    return getTemplateStringValue(value, valueType, expressionSources);
  }
  return getExpressionValue(value, valueType, expressionSources) ?? value;
}

/**
 * Construct a string by replacing any expressions in the provided
 * template string literal with the expression's actual value.
 *
 * @param templateString - the template string literal to process.
 * @param propType - the expected prop value's type.
 * @param expressionSources - a map of expression source to its field names and values.
 * @returns a string with actual expresssion value(s) constructed from the template string literal.
 */
function getTemplateStringValue(
  templateString: string,
  propType: PropValueType,
  expressionSources: ExpressionSources
): string {
  const hydratedString = templateString.replaceAll(
    TEMPLATE_STRING_EXPRESSION_REGEX,
    (...args) => {
      const expressionVal = getExpressionValue(
        args[1],
        propType,
        expressionSources
      );
      if (expressionVal !== null) {
        return expressionVal.toString();
      }
      return args[0];
    }
  );
  return TemplateExpressionFormatter.getTemplateStringDisplayValue(
    hydratedString
  );
}

/**
 * Identify expression source type used in the provided string and derive the
 * expression's actual value using the provided map of expression sources.
 *
 * @param expression - the expression string to extract the actual value
 * @param propType - the expected prop value's type.
 * @param expressionSources - a map of expression source to its field names and values.
 * @returns the expression's actual value
 */
function getExpressionValue(
  expression: string,
  propType: PropValueType,
  expressionSources: ExpressionSources
): string | number | boolean | null | Record<string, unknown> {
  function createPropVal(value: unknown): PropVal | null {
    const propVal = {
      kind: PropValueKind.Literal,
      valueType: propType,
      value,
    };
    if (!TypeGuards.isValidPropValue(propVal)) {
      return null;
    }
    return propVal;
  }

  function getValueFromPath(path: string, parentPath: keyof ExpressionSources) {
    const sourceObject = expressionSources[parentPath];
    if (!sourceObject) {
      console.warn(
        `Invalid expression source type: ${parentPath}. ` +
          `Unable to extract the desired data from path: ${path}`,
        expressionSources
      );
      return null;
    }
    const newPropValue = get({ [parentPath]: sourceObject }, path) as unknown;
    const propVal = createPropVal(newPropValue);
    if (!propVal) {
      console.warn(
        `Invalid expression prop value: ${newPropValue}. ` +
          `The value extracted from the expression "${path}" ` +
          `does not match with the expected propType ${propType}.`
      );
      return null;
    }

    if (propVal.valueType === PropValueType.Object) {
      return transformPropValuesToRaw(propVal.value);
    }
    return propVal.value;
  }

  if (TypeGuards.isSiteSettingsExpression(expression)) {
    return getValueFromPath(expression, "siteSettings");
  }
  if (TypeGuards.isStreamsDataExpression(expression)) {
    return getValueFromPath(expression, "document");
  }
  if (expression.startsWith("props.")) {
    return getValueFromPath(expression, "props");
  }
  if (expression.startsWith("item")) {
    return getValueFromPath(expression, "item");
  }
  return null;
}

export type ExpressionSources = {
  [key in "document" | "siteSettings" | "props"]?: Record<string, unknown>;
} & { item?: unknown };

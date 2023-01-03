import {
  PropValueType,
  PropValueKind,
  TypeGuards,
  TEMPLATE_STRING_EXPRESSION_REGEX,
  PropValues,
  PropShape,
} from "@yext/studio-plugin";
import lodashGet from "lodash/get";
import getPropTypeDefaultValue from "./getPropTypeDefaultValue";

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
  expressionSources: Record<string, Record<string, unknown>>
): Record<string, unknown> {
  const transformedProps: Record<string, unknown> = {};
  Object.keys(propShape).forEach((propName) => {
    if (!props[propName] && propShape[propName]) {
      transformedProps[propName] = getPropTypeDefaultValue(
        propShape[propName].type
      );
      return;
    }
    const { kind, value, valueType } = props[propName];
    if (kind === PropValueKind.Expression) {
      if (TypeGuards.isTemplateString(value)) {
        transformedProps[propName] = getTemplateStringValue(
          value,
          valueType,
          expressionSources
        );
      } else {
        transformedProps[propName] =
          getExpressionValue(value, valueType, expressionSources) ?? value;
      }
    } else {
      transformedProps[propName] = value;
    }
  });
  return transformedProps;
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
  expressionSources: Record<string, Record<string, unknown>>
): string {
  const templateStringWithoutBacktiks = templateString.substring(
    1,
    templateString.length - 1
  );
  return templateStringWithoutBacktiks.replaceAll(
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
  expressionSources: Record<string, Record<string, unknown>>
): string | number | boolean | null {
  function getValueFromPath(path: string, parentPath: string) {
    const sourceObject = expressionSources[parentPath];
    if (!sourceObject) {
      console.warn(
        `Invalid expression source type: ${parentPath}. Unable to extract the desired data from path: ${path}`
      );
      return null;
    }
    const newPropValue =
      (lodashGet({ [parentPath]: sourceObject }, path) as unknown) ?? path;
    const propVal = {
      kind: PropValueKind.Literal,
      valueType: propType,
      value: newPropValue,
    };
    if (TypeGuards.isValidPropValue(propVal)) {
      return propVal.value;
    } else {
      console.warn(
        `Invalid expression prop value: ${newPropValue}. The value extracted from the expression "${path}" does not match with the expected propType ${propType}.`
      );
      return null;
    }
  }

  if (TypeGuards.isSiteSettingsExpression(expression)) {
    return getValueFromPath(expression, "siteSettings");
  }
  if (TypeGuards.isStreamsDataExpression(expression)) {
    return getValueFromPath(expression, "document");
  }
  return null;
}

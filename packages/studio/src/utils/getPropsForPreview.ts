import {
  PropValueType,
  PropValueKind,
  TypeGuards,
  TEMPLATE_STRING_EXPRESSION_REGEX,
  PropValues,
  PropShape,
  PropVal,
  PropType,
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
export function getPropsForPreview(
  props: PropValues,
  propShape: PropShape,
  expressionSources: ExpressionSources
): Record<string, unknown> {
  const transformedProps: Record<string, unknown> = {};
  Object.keys(propShape).forEach((propName) => {
    const value = getPropValueForPreview(
      props[propName],
      propShape[propName],
      expressionSources
    );
    if (value !== undefined) {
      transformedProps[propName] = value;
    }
  });
  return transformedProps;
}

function getPropValueForPreview(
  propVal: PropVal | undefined,
  propType: PropType,
  expressionSources: ExpressionSources
) {
  if (!propVal) {
    return handleNoPropVal(propType.type);
  } else if (propVal.kind === PropValueKind.Expression) {
    return handleExpressionProp(propVal.value, propType, expressionSources);
  } else if (propVal.valueType === PropValueType.Object) {
    return handleObjectProp(propVal.value, propType, expressionSources);
  } else {
    return propVal.value;
  }
}

function handleNoPropVal(valueType: PropValueType) {
  if (valueType === PropValueType.Object || valueType === PropValueType.Array) {
    return undefined;
  }
  return PropValueHelpers.getLiteralPropDefaultValue(valueType);
}

function handleExpressionProp(
  value: string,
  propType: PropType,
  expressionSources: ExpressionSources
) {
  if (propType.type === PropValueType.Record) {
    return value;
  }
  const literalValue = getExpressionPropLiteralValue(
    value,
    propType,
    expressionSources
  );
  if (propType.type !== PropValueType.Array || Array.isArray(literalValue)) {
    return literalValue;
  }
}

function handleObjectProp(
  value: PropValues,
  propType: PropType,
  expressionSources: ExpressionSources
) {
  if (propType.type !== PropValueType.Object) {
    throw new Error(
      `Expected PropMetadata of type Object, received ${propType.type}`
    );
  }
  return getPropsForPreview(value, propType.shape, expressionSources);
}

/**
 * Calculates the underlying literal value for an {@link ExpressionProp}.
 */
function getExpressionPropLiteralValue(
  value: string,
  propType: PropType,
  expressionSources: ExpressionSources
) {
  if (value === "") {
    return value;
  }
  if (TypeGuards.isTemplateString(value)) {
    return getTemplateStringValue(value, propType, expressionSources);
  }
  return getExpressionValue(value, propType, expressionSources) ?? value;
}

/**
 * Construct a string by replacing any expressions in the provided
 * template string literal with the expression's actual value.
 *
 * @param templateString - the template string literal to process
 * @param propType - the expected prop value's type
 * @param expressionSources - a map of expression source to its field names and values
 * @returns a string with actual expresssion value(s) constructed from the template string literal
 */
function getTemplateStringValue(
  templateString: string,
  propType: PropType,
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
      if (expressionVal !== null && expressionVal !== undefined) {
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
 * @param propType - the expected prop value's type
 * @param expressionSources - a map of expression source to its field names and values
 * @returns the expression's actual value
 */
function getExpressionValue(
  expression: string,
  propType: PropType,
  expressionSources: ExpressionSources
): string | number | boolean | null | Record<string, unknown> | unknown[] {
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
    const pathWithoutOptionalChaining = path.replaceAll(/\?\./g, ".");
    const newPropValue = get(
      { [parentPath]: sourceObject },
      pathWithoutOptionalChaining
    ) as unknown;
    if (TypeGuards.valueMatchesPropType(propType, newPropValue)) {
      return newPropValue;
    } else {
      logInvalidExpressionWarning(newPropValue, path, propType);
      return null;
    }
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
  console.warn(
    `Invalid expression: ${expression}.` +
      " Expressions must reference an expression source from",
    expressionSources
  );
  return null;
}

function logInvalidExpressionWarning(
  value: unknown,
  expression: string,
  propType: PropType
) {
  console.warn(
    "Invalid expression prop value:",
    value,
    `The value extracted from the expression "${expression}" ` +
      `does not match with the expected propValueType ${propType.type}`,
    ...(propType.type === PropValueType.Object
      ? ["with shape", propType.shape]
      : propType.type === PropValueType.Array
      ? ["with item type", propType.itemType]
      : [])
  );
}

export type ExpressionSources = {
  [key in "document" | "siteSettings" | "props"]?: Record<string, unknown>;
} & { item?: unknown };

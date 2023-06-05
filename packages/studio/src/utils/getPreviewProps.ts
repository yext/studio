import {
  PropValueType,
  PropValueKind,
  TypeGuards,
  TEMPLATE_STRING_EXPRESSION_REGEX,
  PropValues,
  PropShape,
  transformPropValToRaw,
  PropVal,
  ExpressionProp,
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
export function getPreviewProps(
  props: PropValues,
  propShape: PropShape,
  expressionSources: ExpressionSources
): Record<string, unknown> {
  const transformedProps: Record<string, unknown> = {};
  Object.keys(propShape).forEach((propName) => {
    const previewProp = getPreviewProp(
      props[propName],
      propShape[propName],
      expressionSources
    );
    if (previewProp !== undefined) {
      transformedProps[propName] = previewProp;
    }
  });
  return transformedProps;
}

function getPreviewProp(
  propVal: PropVal | undefined,
  propType: PropType,
  expressionSources: ExpressionSources
) {
  if (
    !propVal &&
    (propType.type === PropValueType.Object ||
      propType.type === PropValueType.Array)
  ) {
    return undefined;
  }

  if (!propVal) {
    return PropValueHelpers.getPropTypeDefaultValue(
      propType.type,
      PropValueKind.Literal
    );
  }
  if (propVal.kind === PropValueKind.Expression) {
    if (propVal.valueType === PropValueType.Record) {
      return propVal.value;
    }
    const literalValue = getExpressionPropLiteralValue(
      propVal,
      propType,
      expressionSources
    );
    if (propType.type !== PropValueType.Array || Array.isArray(literalValue)) {
      return literalValue;
    }
  } else if (propVal.valueType === PropValueType.Object) {
    if (propType.type !== PropValueType.Object) {
      throw new Error(
        `Expected PropMetadata of type Object, received ${propType.type}`
      );
    }
    return getPreviewProps(propVal.value, propType.shape, expressionSources);
  } else {
    return propVal.value;
  }
}

/**
 * Calculates the underlying literal value for an {@link ExpressionProp}.
 */
function getExpressionPropLiteralValue(
  { value, valueType }: ExpressionProp,
  propType: PropType,
  expressionSources: ExpressionSources
) {
  if (TypeGuards.isTemplateString(value)) {
    return getTemplateStringValue(
      value,
      valueType,
      propType,
      expressionSources
    );
  }
  return (
    getExpressionValue(value, valueType, propType, expressionSources) ?? value
  );
}

/**
 * Construct a string by replacing any expressions in the provided
 * template string literal with the expression's actual value.
 *
 * @param templateString - the template string literal to process
 * @param valueType - the expected prop value's type
 * @param propType - the type of the prop
 * @param expressionSources - a map of expression source to its field names and values
 * @returns a string with actual expresssion value(s) constructed from the template string literal
 */
function getTemplateStringValue(
  templateString: string,
  valueType: PropValueType,
  propType: PropType,
  expressionSources: ExpressionSources
): string {
  const hydratedString = templateString.replaceAll(
    TEMPLATE_STRING_EXPRESSION_REGEX,
    (...args) => {
      const expressionVal = getExpressionValue(
        args[1],
        valueType,
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
 * @param valueType - the expected prop value's type
 * @param propType - the type of the prop
 * @param expressionSources - a map of expression source to its field names and values
 * @returns the expression's actual value
 */
function getExpressionValue(
  expression: string,
  valueType: PropValueType,
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
    const propVal = createPropVal(newPropValue, propType, valueType);
    if (!propVal) {
      logInvalidExpressionWarning(newPropValue, path, propType);
      return null;
    }
    return transformPropValToRaw(propVal);
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

/**
 * Creates a PropVal with the provided data. If a valid one cannot be created,
 * returns null.
 */
function createPropVal(
  value: unknown,
  propType: PropType,
  valueType?: PropValueType
): PropVal | null {
  const propVal = {
    kind: PropValueKind.Literal,
    valueType: valueType ?? propType.type,
    value,
  };
  if (propType.type === PropValueType.Array && Array.isArray(value)) {
    const propVals = value.map((itemValue) =>
      createPropVal(itemValue, propType.itemType)
    );
    if (propVals.some((val) => val === null)) {
      return null;
    } else {
      propVal.value = propVals;
    }
  } else if (
    propType.type === PropValueType.Object &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    value !== null
  ) {
    const propValues = Object.fromEntries(
      Object.entries(value).map(([field, fieldVal]) => [
        field,
        createPropVal(fieldVal, propType.shape[field]),
      ])
    );
    if (Object.values(propValues).some((val) => val === null)) {
      return null;
    } else {
      propVal.value = propValues;
    }
  }
  if (!TypeGuards.isValidPropVal(propVal)) {
    return null;
  }
  return propVal;
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

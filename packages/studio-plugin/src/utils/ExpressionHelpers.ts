import TypeGuards from "../utils/TypeGuards";
import { TEMPLATE_STRING_EXPRESSION_REGEX } from "../constants";
/**
 * A static class for housing various util functions related to expressions.
 */
export default class ExpressionHelpers {
  /**
   * Checks whether the expression uses a specific expression source, such as
   * `document` or `props`.
   */
  static usesExpressionSource(expression: string, source: string) {
    // This is used to create the regex: /\${source\..*}/
    const regexStr = "\\${" + source + "\\..*}";
    const templateStringRegex = new RegExp(regexStr, "g");
    return (
      expression === source ||
      expression.startsWith(source + ".") ||
      expression.match(templateStringRegex) ||
      expression.includes("${" + source + "}")
    );
  }

  /**
   * Takes in an expression or template string and parses it into an array of
   * only expressions containing the specified source.
   */
  static convertsExpressionToPaths(
    expression: string,
    source: string
  ): string[] {
    if (TypeGuards.isTemplateString(expression)) {
      return [...expression.matchAll(TEMPLATE_STRING_EXPRESSION_REGEX)]
        .map((m) => m[1])
        .filter((m) => this.usesExpressionSource(m, source));
    }
    if (this.usesExpressionSource(expression, source)) return [expression];
    return [];
  }
}

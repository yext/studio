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
    const templateStringRegex = new RegExp(regexStr);

    return (
      expression === source ||
      expression.startsWith(source + ".") ||
      expression.match(templateStringRegex) ||
      expression.includes("${" + source + "}")
    );
  }
}

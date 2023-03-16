/**
 * ExpressionFormatter contains various static utility methods
 * for formatting expression strings.
 */
export default class ExpressionFormatter {
  /**
   * Converts curly braces to square brackets where needed,
   * and removes backticks.
   */
  static getTemplateStringDisplayValue(value: string): string {
    value = this.convertCurlyBracesToSquareBrackets(value);
    return this.removeBackticks(value);
  }

  /**
   * Converts square brackets to curly braces where needed,
   * and adds backticks.
   */
  static getRawValue(value: string): string {
    value = this.convertSquareBracketsToCurlyBraces(value);
    return this.addBackticks(value);
  }

  /**
   * Converts `[[field]]` usages into `${document.<field>}` and removes
   * enclosing backtiks.
   */
  private static convertSquareBracketsToCurlyBraces(value: string) {
    return value.replaceAll(/\[\[(.*?)\]\]/g, (_substring, match) => {
      return "${document." + match + "}";
    });
  }

  /**
   * Converts `${document.<field>}` usages into `[[field]]`.
   */
  private static convertCurlyBracesToSquareBrackets(value: string) {
    return value.replaceAll(/\${document\.(.*?)}/g, (_substring, match) => {
      return "[[" + match + "]]";
    });
  }

  private static addBackticks(value: string): string {
    if (this.hasBackticks(value)) {
      return value;
    }
    return "`" + value + "`";
  }

  private static removeBackticks(value: string): string {
    if (this.hasBackticks(value)) {
      return value.slice(1, -1);
    }
    return value;
  }

  private static hasBackticks(value: string): boolean {
    return value.length >= 2 && value.startsWith("`") && value.endsWith("`");
  }
}

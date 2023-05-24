/**
 * TemplateExpressionFormatter contains various static utility methods
 * for formatting template expression strings.
 */
export default class TemplateExpressionFormatter {
  /**
   * Converts curly braces to square brackets where needed,
   * and removes backticks.
   */
  static getTemplateStringDisplayValue(value: string): string {
    value = this.removeBackticks(value);
    return this.convertCurlyBracesToSquareBrackets(value);
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
   * Converts `[[<field>]]` usages into `${document.<field>}` and
   * `[[<field>[<num>]]]` to `${document.<field>[<num>]}`.
   */
  private static convertSquareBracketsToCurlyBraces(value: string) {
    return value.replaceAll(/\[\[(.*?(\[\d+\])?)\]\]/g, (_substring, match) => {
      return "${document." + match + "}";
    });
  }

  /**
   * Converts `${document.<field>}` usages into `[[field]]`.
   */
  static convertCurlyBracesToSquareBrackets(value: string) {
    return value.replaceAll(/\${document\.(.*?)}/g, (_substring, match) => {
      return "[[" + match + "]]";
    });
  }

  static addBackticks(value: string): string {
    return "`" + value + "`";
  }

  private static removeBackticks(value: string): string {
    if (!this.hasBackticks(value)) {
      throw new Error("Unable to remove backticks from: " + value);
    }
    return value.slice(1, -1);
  }

  static hasBackticks(value: string): boolean {
    return value.length >= 2 && value.startsWith("`") && value.endsWith("`");
  }
}

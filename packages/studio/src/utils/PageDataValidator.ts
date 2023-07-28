/**
 * PageDataValidator contains various static utility methods
 * for validation of user-inputted page data.
 */
export default class PageDataValidator {
  /**
   * Throws an error if the user-inputted URL Slug is invalid.
   */
  static validateURLSlug(input: string, isEntityPage?: boolean) {
    const cleanInput = isEntityPage
      ? input.replace(/\${document\..*?}/g, "")
      : input;
    const blackListURLChars = new RegExp(/[ <>""''|\\{}[\]]/g);
    const errorChars = cleanInput.match(blackListURLChars);
    if (errorChars) {
      throw new Error(
        `URL slug contains invalid characters: ${[...new Set(errorChars)].join(
          ""
        )}`
      );
    }
  }

  /**
   * Throws an error if the user-inputted page name is invalid.
   */
  static validatePageName(pageName: string) {
    if (!pageName) {
      throw new Error("Error adding page: a pageName is required.");
    }
    const errorChars = pageName.match(/[\\/?%*:|"<>]/g);
    if (errorChars) {
      throw new Error(
        `Error adding page: pageName ${pageName} cannot contain the characters: ${[
          ...new Set(errorChars),
        ].join("")}`
      );
    }
    if (pageName.endsWith(".")) {
      throw new Error(
        `Error adding page: pageName ${pageName} cannot end with a period.`
      );
    }
    if (pageName.length > 255) {
      throw new Error(
        "Error adding page: pageName must be 255 characters or less."
      );
    }
  }
}

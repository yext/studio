import { PagesRecord } from "../store/models/slices/PageSlice";

export const PAGES_JS_RESERVED_PAGE_NAMES = ["_server", "_client"];

export interface ValidationResult {
  valid: boolean;
  errorMessages: string[];
}

/**
 * PageDataValidator contains various static utility methods
 * for validation of user-inputted page data.
 */
export default class PageDataValidator {
  private isEntityPage: boolean;
  private isPagesJSRepo: boolean;
  private pages: PagesRecord;

  constructor({
    isEntityPage,
    isPagesJSRepo,
    pages,
  }: {
    isEntityPage: boolean;
    isPagesJSRepo: boolean;
    pages?: PagesRecord;
  }) {
    this.isEntityPage = isEntityPage;
    this.isPagesJSRepo = isPagesJSRepo;
    this.pages = pages ?? {};
  }

  checkIsURLEditable(url?: string) {
    if (!url) {
      return false;
    }
    const result: ValidationResult = this.validate({ url });
    return result.valid;
  }
  /**
   * Throws an error if the user-inputted page data is invalid.
   */
  validate(pageData: { pageName?: string; url?: string }): ValidationResult {
    const errorMessages: string[] = [];
    const { pageName, url } = pageData;
    if (pageName !== undefined) {
      errorMessages.push(...this.validatePageName(pageName));
    }

    if (this.isPagesJSRepo) {
      errorMessages.push(...this.validateURL(url));
    }
    return {
      valid: errorMessages.length === 0,
      errorMessages: errorMessages,
    } as ValidationResult;
  }

  /**
   * Throws an error if the page name is invalid.
   */
  private validatePageName(pageName: string) {
    const errorMessages: string[] = [];
    if (!pageName) {
      errorMessages.push("A page name is required.");
    }
    const errorChars = pageName.match(/[\\/?%*:|"<>]/g);
    if (errorChars) {
      errorMessages.push(
        `Page name cannot contain the characters: ${[
          ...new Set(errorChars),
        ].join("")}`
      );
    }
    if (pageName.endsWith(".")) {
      errorMessages.push(`Page name cannot end with a period.`);
    }
    if (pageName.length > 255) {
      errorMessages.push("Page name must be 255 characters or less.");
    }
    if (this.isPagesJSRepo && PAGES_JS_RESERVED_PAGE_NAMES.includes(pageName)) {
      errorMessages.push(
        `Page name "${pageName}" is a reserved PagesJS filename.`
      );
    }
    if (this.pages[pageName]) {
      errorMessages.push(`Page name "${pageName}" is already used.`);
    }
    return errorMessages;
  }

  private validateURL(url: string | undefined) {
    const errorMessages: string[] = [];
    if (!url) {
      errorMessages.push("A URL is required.");
    } else {
      errorMessages.push(...this.validateURLSlug(url, this.isEntityPage));
    }
    return errorMessages;
  }

  /**
   * Throws an error if the URL Slug is invalid.
   */
  private validateURLSlug(input: string, isEntityPage?: boolean) {
    const cleanInput = isEntityPage
      ? input.replace(/\${document\..*?}/g, "")
      : input;
    const blackListURLChars = new RegExp(/[ <>""''|\\{}[\]]/g);
    const errorChars = cleanInput.match(blackListURLChars);
    const errorMessages: string[] = [];
    if (errorChars) {
      errorMessages.push(
        `URL slug contains invalid characters: ${[...new Set(errorChars)].join(
          ""
        )}`
      );
    }
    return errorMessages;
  }
}

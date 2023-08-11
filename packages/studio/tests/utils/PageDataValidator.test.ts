import PageDataValidator, { ValidationResult } from "../../src/utils/PageDataValidator";

describe("URL slug validation", () => {
  function expectURLError(
    input: string,
    errorMessage: string,
    isEntityPage?: boolean
  ) {
    const validator = new PageDataValidator(isEntityPage);
    const result: ValidationResult = validator.validate({ url: input });
    expect(result).toEqual({valid: false, errorMessages: errorMessage});
  }

  it("gives an error for document expression in a static field", () => {
    const errorMessage = "URL slug contains invalid characters: {}";
    expectURLError("${document.field}", errorMessage);
  });

  it("does not give an error for valid document expression in an entity page", () => {
    const validator = new PageDataValidator(true);
    const result = validator.validate({
      url: "${document.field}-${document.slug}",
    });
    expect(result).toEqual({valid: true, errorMessages: ""});
  });

  it("gives an error for a document expression with invalid characters", () => {
    const errorMessage = "URL slug contains invalid characters: <>[]{}";
    expectURLError(
      "${document.field}<>[[]]{}${document.slug}",
      errorMessage,
      true
    );
  });
});

describe("page name validation", () => {
  function expectPageNameError(input: string, errorMessage: string) {
    const validator = new PageDataValidator();
    const result: ValidationResult = validator.validate({ pageName: input });
    expect(result).toEqual({valid: false, errorMessages: errorMessage});
  }

  it("gives an error for an empty string pagename", () => {
    const errorMessage = "A page name is required.";
    expectPageNameError("", errorMessage);
  });

  it("gives an error for a pagename with multiple special characters", () => {
    const errorMessage = 'Page name cannot contain the characters: \\|"<>?';
    expectPageNameError('test\\|"<>?', errorMessage);
  });

  it("gives an error for a pagename ending in a period", () => {
    const errorMessage = "Page name cannot end with a period.";
    expectPageNameError("test.", errorMessage);
  });

  it("gives an error for a pagename 256 characters long", () => {
    const longName = "a".repeat(256);
    const errorMessage = "Page name must be 255 characters or less.";
    expectPageNameError(longName, errorMessage);
  });
});

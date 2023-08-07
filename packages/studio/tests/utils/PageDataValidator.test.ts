import PageDataValidator from "../../src/utils/PageDataValidator";

describe("URL slug validation", () => {
  function expectURLError(
    input: string,
    errorMessage: string,
    isEntityPage?: boolean
  ) {
    const validator = new PageDataValidator(isEntityPage);
    expect(() => validator.validate({ url: input })).toThrow(errorMessage);
  }

  it("gives an error for document expression in a static field", () => {
    const errorMessage = "URL slug contains invalid characters: {}";
    expectURLError("${document.field}", errorMessage);
  });

  it("does not give an error for valid document expression in an entity page", () => {
    const validator = new PageDataValidator(true);
    expect(() =>
      validator.validate({
        url: "${document.field}-${document.slug}",
      })
    ).not.toThrowError();
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
    expect(() => validator.validate({ pageName: input })).toThrow(errorMessage);
  }

  it("gives an error for an empty string pagename", () => {
    const errorMessage = "Error adding page: a pageName is required.";
    expectPageNameError("", errorMessage);
  });

  it("gives an error for a pagename with multiple special characters", () => {
    const errorMessage =
      'Error adding page: pageName test\\|"<>? cannot contain the characters: \\|"<>?';
    expectPageNameError('test\\|"<>?', errorMessage);
  });

  it("gives an error for a pagename ending in a period", () => {
    const errorMessage =
      "Error adding page: pageName test. cannot end with a period.";
    expectPageNameError("test.", errorMessage);
  });

  it("gives an error for a pagename 256 characters long", () => {
    const longName = "a".repeat(256);
    const errorMessage =
      "Error adding page: pageName must be 255 characters or less.";
    expectPageNameError(longName, errorMessage);
  });
});

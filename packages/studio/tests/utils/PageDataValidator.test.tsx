import PageDataValidator from "../../src/utils/PageDataValidator";

describe("URL slug validation", () => {
  function expectURLError(input: string, errorMessage: string, isEntityPage?: boolean) {
    expect(() => PageDataValidator.validateURLSlug(input, isEntityPage)).toThrow(errorMessage);
  }

  it("gives an error for document expression in a static field", () => {
    const errorMessage = "URL slug contains invalid characters: {}";
    expectURLError("${document.field}", errorMessage);
  })

  it("does not give an error for valid document expression in an entity page", () => {
    expect(() => PageDataValidator.validateURLSlug("${document.field}-${document.slug}", true)).not.toThrowError();
  });

  it("gives an error for a document expression with invalid characters", () => {
    const errorMessage = "URL slug contains invalid characters: <>[]{}";
    expectURLError("${document.field}<>[[]]{}${document.slug}", errorMessage, true);
  })
})

describe("page name validation", () => {
  
});

import getNpmPackageName from "../../src/parsers/getNpmPackageName";

describe("getNpmPackageName()", () => {
  it("detects an npm package and returns the name.", () => {
    expect(getNpmPackageName("Some/path/to/node_modules/package-name")).toBe("package-name");
  });

  it("detects an npm package within an organization and returns the name.", () => {
    expect(getNpmPackageName("Some/path/to/node_modules/@yext/package-name")).toBe("@yext/package-name");
  });

  it("returns an empty string when given a path that is not an npm package.", () => {
    expect(getNpmPackageName("Some/path/to/somewhere/@yext/package-name")).toBe("");
  });
});
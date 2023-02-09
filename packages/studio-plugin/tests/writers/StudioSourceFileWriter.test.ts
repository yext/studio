import { Project } from "ts-morph";
import { PropValueKind, PropValueType } from "../../src/types";
import StudioSourceFileWriter from "../../src/writers/StudioSourceFileWriter";

describe("createPropsObjectLiteralWriter", () => {
  it("errors out if site settings new value contains expression type", () => {
    const filepath = "/some/absolute/file/path";
    const project = new Project();
    project.createSourceFile(filepath, "");
    const writer = new StudioSourceFileWriter(filepath, project);
    expect(() =>
      writer.createPropsObjectLiteralWriter({
        mySetting: {
          valueType: PropValueType.string,
          kind: PropValueKind.Expression,
          value: "someExpression.field",
        },
      })
    ).toThrow(
      `PropVal mySetting in ${filepath} is of kind PropValueKind.Expression.` +
        " PropValueKind.Expression in ObjectLiteralExpression is currently not supported."
    );
  });
});

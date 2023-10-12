import getStreamFields, {
  NON_CONFIGURABLE_STREAM_PROPERTIES,
} from "../../src/utils/getStreamFields";

const expectArrayEquality = (actual, expected) => {
  expect(actual.sort()).toEqual(expected.sort());
};

describe("getStreamFields", () => {
  it("preserves slug field", () => {
    const existingFields = ["slug"];
    const newFields = ["newField"];

    expectArrayEquality(
      ["slug", "newField"],
      getStreamFields(existingFields, newFields)
    );
  });

  it("removes previous, non-slug fields", () => {
    const existingFields = ["existingField1", "existingField2"];
    const newFields = ["newField1", "newField2"];

    expectArrayEquality(newFields, getStreamFields(existingFields, newFields));
  });

  it("correctly filters out Non-Configurable Stream Properties", () => {
    const newFields = ["newField1", ...NON_CONFIGURABLE_STREAM_PROPERTIES];

    expectArrayEquality(["newField1"], getStreamFields([], newFields));
  });

  it("filters out sub-fields when parent field is also present", () => {
    const newFields = ["address", "address.line1", "address.line2"];

    expectArrayEquality(["address"], getStreamFields([], newFields));
  });

  it("does not filter out sub-fields when parent field is missing", () => {
    const newFields = ["address.line1", "address.line2"];

    expectArrayEquality(newFields, getStreamFields([], newFields));
  });

  it("correctly handles array fields", () => {
    const newFields = ["arrayField[0]", "arrayField[1]"];

    expectArrayEquality(["arrayField"], getStreamFields([], newFields));
  });

  it("removes duplicate fields", () => {
    const newFields = ["field1", "field1"];

    expectArrayEquality(["field1"], getStreamFields([], newFields));
  });
});

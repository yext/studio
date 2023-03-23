import filterStreamDocument from "../../src/utils/filterStreamDocument";

it("can filter by fieldType = array", () => {
  const streamDocument = {
    str: "stringy",
    arr: ["an arr"],
    nestedObj: {
      nestedArr: ["hey"],
      deletMe: {
        hi: "hi",
      },
    },
    ignoreMe: {
      ignore: "moi",
    },
  };

  expect(filterStreamDocument("array", streamDocument)).toEqual({
    arr: ["an arr"],
    nestedObj: {
      nestedArr: ["hey"],
    },
  });
});

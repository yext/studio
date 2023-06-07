import filterEntityData from "../../src/utils/filterEntityData";

it("successfully filters based on fieldFilter", () => {
  const entityData = {
    str: "stringy",
    arr: ["an arr"],
    nestedObj: {
      nestedArr: ["hey"],
      numArr: [3],
      deletMe: {
        hi: "hi",
      },
    },
    ignoreMe: {
      ignore: "moi",
    },
  };

  expect(filterEntityData(Array.isArray, entityData)).toEqual({
    arr: ["an arr"],
    nestedObj: {
      nestedArr: ["hey"],
      numArr: [3],
    },
  });
});

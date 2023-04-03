import filterEntityData from "../../src/utils/filterEntityData";

it("can filter by fieldType = array", () => {
  const entityData = {
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

  expect(filterEntityData("array", entityData)).toEqual({
    arr: ["an arr"],
    nestedObj: {
      nestedArr: ["hey"],
    },
  });
});

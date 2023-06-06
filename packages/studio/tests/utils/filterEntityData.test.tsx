import { PropValueType } from "@yext/studio-plugin";
import filterEntityData from "../../src/utils/filterEntityData";

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

it("can filter by PropValueType.Array as fieldType", () => {
  expect(filterEntityData(PropValueType.Array, entityData)).toEqual({
    arr: ["an arr"],
    nestedObj: {
      nestedArr: ["hey"],
      numArr: [3],
    },
  });
});

it("can filter by Array PropType as fieldType", () => {
  expect(
    filterEntityData(
      {
        type: PropValueType.Array,
        itemType: { type: PropValueType.string },
      },
      entityData
    )
  ).toEqual({
    arr: ["an arr"],
    nestedObj: {
      nestedArr: ["hey"],
    },
  });
});

import * as uuidUtils from "uuid";

export function spyOnUUID() {
  let uuidCount = 0;
  jest.spyOn(uuidUtils, "v4").mockImplementation(() => {
    return `mock-uuid-${uuidCount++}`;
  });
}
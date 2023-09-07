import * as sendMessageModule from "../../../src/messaging/sendMessage";
import { MessageID, ResponseType } from "@yext/studio-plugin";
import {
  fetchInitialEntitiesRecord,
  fetchSavedFilters,
} from "../../../src/store/slices/accountContent/utils";

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  consoleErrorSpy = jest.spyOn(global.console, "error").mockImplementation();
});

describe("fetchSavedFilters", () => {
  it("returns an empty array if fetch returns an error", async () => {
    jest.spyOn(sendMessageModule, "default").mockImplementation(() => {
      return new Promise((resolve) =>
        resolve({
          msg: "msg",
          type: ResponseType.Error,
        })
      );
    });

    expect(consoleErrorSpy).toBeCalledTimes(0);
    const savedFilters = await fetchSavedFilters();
    expect(savedFilters).toEqual([]);
    expect(consoleErrorSpy).toBeCalledTimes(1);
    expect(consoleErrorSpy).toBeCalledWith("msg");
  });
});

describe("fetchInitialEntitiesRecord", () => {
  it("returns an empty entities record if error fetching entity types", async () => {
    jest.spyOn(sendMessageModule, "default").mockImplementation(() => {
      return new Promise((resolve) =>
        resolve({
          msg: "msg",
          type: ResponseType.Error,
        })
      );
    });

    expect(consoleErrorSpy).toBeCalledTimes(0);
    const entitiesRecord = await fetchInitialEntitiesRecord();
    expect(entitiesRecord).toEqual({});
    expect(consoleErrorSpy).toBeCalledTimes(1);
    expect(consoleErrorSpy).toBeCalledWith("msg");
  });

  it("ignores entity types with zero entities or an error response", async () => {
    jest
      .spyOn(sendMessageModule, "default")
      .mockImplementation((messageId: MessageID, payload) => {
        if (messageId === MessageID.GetEntityTypes) {
          return new Promise((resolve) =>
            resolve({
              msg: "msg",
              type: ResponseType.Success,
              entityTypes: ["product", "location", "ce_test"],
            })
          );
        }

        const entityType = payload?.["entityType"];
        switch (entityType) {
          case "product":
            return new Promise((resolve) =>
              resolve({ msg: "msg", type: ResponseType.Error })
            );
          case "ce_test":
            return new Promise((resolve) =>
              resolve({
                msg: "msg",
                type: ResponseType.Success,
                entities: {
                  totalCount: 0,
                  entities: [],
                },
              })
            );
          default:
            return new Promise((resolve) =>
              resolve({
                msg: "msg",
                type: ResponseType.Success,
                entities: {
                  totalCount: 1,
                  entities: [
                    {
                      id: "entity",
                      displayName: "Entity",
                    },
                  ],
                },
              })
            );
        }
      });

    expect(consoleErrorSpy).toBeCalledTimes(0);
    const entitiesRecord = await fetchInitialEntitiesRecord();
    expect(entitiesRecord).toEqual({
      location: {
        totalCount: 1,
        entities: [
          {
            id: "entity",
            displayName: "Entity",
          },
        ],
      },
    });
    expect(consoleErrorSpy).toBeCalledTimes(1);
    expect(consoleErrorSpy).toBeCalledWith("msg");
  });
});

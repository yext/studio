import { StudioStore } from "../../../src/store/models/StudioStore";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";
import * as sendMessageModule from "../../../src/messaging/sendMessage";
import { MessageID, ResponseType } from "@yext/studio-plugin";
import { waitFor } from "@testing-library/react";

describe("refreshBaseAccountContent", () => {
  beforeEach(() => {
    mockStore({
      accountContent: {
        savedFilters: [
          {
            id: "saved-filter",
            displayName: "Saved Filter",
          },
        ],
        entitiesRecord: {
          location: {
            totalCount: 1,
            entities: [
              {
                id: "entity",
                displayName: "Entity",
              },
            ],
          },
        },
      },
    });

    jest
      .spyOn(sendMessageModule, "default")
      .mockImplementation((messageId: MessageID) => {
        switch (messageId) {
          case MessageID.GetSavedFilters:
            return new Promise((resolve) =>
              resolve({
                msg: "msg",
                type: ResponseType.Success,
                savedFilters: [
                  {
                    id: "saved-filter-2",
                    displayName: "Saved Filter 2",
                  },
                ],
              })
            );
          case MessageID.GetEntityTypes:
            return new Promise((resolve) =>
              resolve({
                msg: "msg",
                type: ResponseType.Success,
                entityTypes: ["product"],
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
                      id: "entity-2",
                      displayName: "Entity 2",
                    },
                  ],
                },
              })
            );
        }
      });
  });

  it("clears and updates saved filters", async () => {
    const getSavedFilters = (store: StudioStore) =>
      store.accountContent.savedFilters;
    expect(getSavedFilters(useStudioStore.getState())).toEqual([
      {
        id: "saved-filter",
        displayName: "Saved Filter",
      },
    ]);

    useStudioStore.getState().accountContent.refreshBaseAccountContent();
    await waitFor(() =>
      expect(getSavedFilters(useStudioStore.getState())).toEqual([
        {
          id: "saved-filter-2",
          displayName: "Saved Filter 2",
        },
      ])
    );
  });

  it("clears and updates entities record", async () => {
    const getEntitiesRecord = (store: StudioStore) =>
      store.accountContent.entitiesRecord;
    expect(getEntitiesRecord(useStudioStore.getState())).toEqual({
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

    useStudioStore.getState().accountContent.refreshBaseAccountContent();
    await waitFor(() =>
      expect(getEntitiesRecord(useStudioStore.getState())).toEqual({
        product: {
          totalCount: 1,
          entities: [
            {
              id: "entity-2",
              displayName: "Entity 2",
            },
          ],
        },
      })
    );
  });
});

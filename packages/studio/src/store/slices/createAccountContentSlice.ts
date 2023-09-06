import { SliceCreator } from "../models/utils";
import AccountContentSlice from "../models/slices/AccountContentSlice";
import { MessageID, ResponseType } from "@yext/studio-plugin";
import sendMessage from "../../messaging/sendMessage";

const createAccountContentSlice: SliceCreator<AccountContentSlice> = (
  set,
  get
) => ({
  // TODO (SLAP-2906): Make API calls to populate this data
  savedFilters: [],
  entitiesRecord: {},
  entityTypes: [],
  async refreshEntityTypes() {
    const res = await sendMessage(MessageID.GetEntityTypes, null, {
      hideSuccessToast: true,
    });
    if (res.type === ResponseType.Success) {
      set((state) => {
        state.entityTypes = res.entityTypes;
      });
    } else {
      console.error(res.msg);
    }
  },
  async fetchEntities(entityType: string, pageNum: number): Promise<void> {
    const res = await sendMessage(
      MessageID.GetEntities,
      {
        entityType,
        pageNum,
      },
      { hideSuccessToast: true }
    );
    if (res.type === ResponseType.Success) {
      const fetchedEntities = res.entities.entities.reduce((prev, curr) => {
        prev[curr.id] = curr;
        return prev;
      }, {});
      set((state) => {
        state.entitiesRecord[entityType] = {
          ...state.entitiesRecord[entityType],
          ...fetchedEntities,
        };
      });
    } else {
      console.error(res.msg);
    }
  },
  async initialize() {
    await get().refreshEntityTypes();
    await Promise.all(
      get().entityTypes.map((entityType) => {
        return get().fetchEntities(entityType, 0);
      })
    );
  },
});

export default createAccountContentSlice;

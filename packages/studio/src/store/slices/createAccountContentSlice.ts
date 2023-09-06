import { SliceCreator } from "../models/utils";
import AccountContentSlice from "../models/slices/AccountContentSlice";
import { MessageID, ResponseType } from "@yext/studio-plugin";
import sendMessage from "../../messaging/sendMessage";

const createAccountContentSlice: SliceCreator<AccountContentSlice> = (set) => ({
  // TODO (SLAP-2906): Make API calls to populate this data
  savedFilters: [],
  entitiesRecord: {},
  entityTypes: ["location", "ce_person"],
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
});

export default createAccountContentSlice;

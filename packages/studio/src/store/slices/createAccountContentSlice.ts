import { SliceCreator } from "../models/utils";
import AccountContentSlice from "../models/slices/AccountContentSlice";

const createAccountContentSlice: SliceCreator<AccountContentSlice> = () => ({
  // TODO (SLAP-2906): Make API calls to populate this data
  savedFilters: [],
  entitiesRecord: {},
});

export default createAccountContentSlice;

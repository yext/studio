import StudioConfigSlice from "../models/slices/StudioConfigSlice";
import { SliceCreator } from "../models/utils";

const createStudioConfigSlice: SliceCreator<StudioConfigSlice> = () => ({
  paths: {
    components: '',
    pages: '',
    modules: '',
    siteSettings: '',
    localData: ''
  },
  isPagesJSRepo: false
});

export default createStudioConfigSlice;

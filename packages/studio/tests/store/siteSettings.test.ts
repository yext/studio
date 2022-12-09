import { useStudioStore } from "../../src/store/store";
import { SiteSettingSliceStates } from "../../src/store/models/slices/siteSettingSlice";
import { PropValueKind, PropValueType } from "@yext/studio-plugin";

const siteSettingsMetadata: SiteSettingSliceStates["metadata"] = {
  propShape: {
    apiKey: {
      type: PropValueType.string,
      doc: "api key to power the site",
    },
  },
};
const siteSettingsValue: SiteSettingSliceStates["state"] = {
  apiKey: {
    kind: PropValueKind.Literal,
    valueType: PropValueType.string,
    value: "test-api-key",
  },
};

describe("SiteSettingSlice", () => {
  it("updates siteSettings' metadata using setMetadata", () => {
    useStudioStore.getState().siteSettings.setMetadata(siteSettingsMetadata);
    const actualMetadata = useStudioStore.getState().siteSettings.metadata;
    expect(actualMetadata).toEqual(siteSettingsMetadata);
  });

  it("updates siteSettings' state values using setState", () => {
    useStudioStore.getState().siteSettings.setState(siteSettingsValue);
    const actualValue = useStudioStore.getState().siteSettings.state;
    expect(actualValue).toEqual(siteSettingsValue);
  });
});

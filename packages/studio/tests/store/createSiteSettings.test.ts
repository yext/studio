import useStudioStore from "../../src/store/useStudioStore";
import { SiteSettingSliceStates } from "../../src/store/models/slices/SiteSettingsSlice";
import { PropValueKind, PropValueType } from "@yext/studio-plugin";

const siteSettingsShape: SiteSettingSliceStates["shape"] = {
  apiKey: {
    type: PropValueType.string,
    doc: "api key to power the site",
    required: false,
  },
};
const siteSettingsValue: SiteSettingSliceStates["values"] = {
  apiKey: {
    kind: PropValueKind.Literal,
    valueType: PropValueType.string,
    value: "test-api-key",
  },
};

it("updates siteSettings' shape using setShape", () => {
  useStudioStore.getState().siteSettings.setShape(siteSettingsShape);
  const actualMetadata = useStudioStore.getState().siteSettings.shape;
  expect(actualMetadata).toEqual(siteSettingsShape);
});

it("updates siteSettings' state values using setState", () => {
  useStudioStore.getState().siteSettings.setValues(siteSettingsValue);
  const actualValue = useStudioStore.getState().siteSettings.values;
  expect(actualValue).toEqual(siteSettingsValue);
});

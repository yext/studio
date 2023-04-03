import { transformPropValuesToRaw } from "@yext/studio-plugin";
import { useState, useLayoutEffect } from "react";
import useStudioStore from "../store/useStudioStore";

/**
 * Parses a SiteSettings object into its raw underlying values.
 */
export default function useRawSiteSettings(): Record<string, unknown> {
  const [rawSiteSettings, setRawSiteSettings] = useState<
    Record<string, unknown>
  >({});
  const siteSettingValues = useStudioStore(
    (store) => store.siteSettings.values
  );

  useLayoutEffect(() => {
    const siteSettingsSource = siteSettingValues
      ? transformPropValuesToRaw(siteSettingValues)
      : {};
    setRawSiteSettings(siteSettingsSource);
  }, [siteSettingValues]);

  return rawSiteSettings;
}

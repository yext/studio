import { transformPropValuesToRaw } from "@yext/studio-plugin";
import { useState, useLayoutEffect } from "react";
import useStudioStore from "../store/useStudioStore";
import { ExpressionSources } from "../utils/getPreviewProps";

type PageExpressionSources = Pick<
  ExpressionSources,
  "document" | "siteSettings"
>;

/**
 * Dynamically load files that serve as page-wide expression sources for the
 * expressions in a prop's value.
 */
export default function usePageExpressionSources(): PageExpressionSources {
  const [expressionSources, setExpressionSources] =
    useState<PageExpressionSources>({});
  const [siteSettingValues, activeEntityFile, localDataPath] = useStudioStore(
    (store) => [
      store.siteSettings.values,
      store.pages.activeEntityFile,
      store.studioConfig.paths.localData,
    ]
  );

  useLayoutEffect(() => {
    const siteSettingsSource = siteSettingValues
      ? transformPropValuesToRaw(siteSettingValues)
      : {};
    setExpressionSources((prev) => ({
      ...prev,
      siteSettings: siteSettingsSource,
    }));
  }, [siteSettingValues]);

  useLayoutEffect(() => {
    if (!activeEntityFile) {
      return setExpressionSources((prev) => {
        const { document: _, ...otherSources } = prev;
        return otherSources;
      });
    }
    const entityFilepath = `${localDataPath}/${activeEntityFile}`;
    import(/* @vite-ignore */ entityFilepath).then((importedModule) => {
      setExpressionSources((prev) => {
        return {
          ...prev,
          document: importedModule["default"] as Record<string, unknown>,
        };
      });
    });
  }, [activeEntityFile, localDataPath]);

  return expressionSources;
}

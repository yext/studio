import { Dispatch, SetStateAction, useMemo } from "react";
import useStudioStore from "../store/useStudioStore";
import ComponentTreePreview from "./ComponentTreePreview";
import useRawSiteSettings from "../hooks/useRawSiteSettings";
import { ITooltip } from "react-tooltip";

export default function PreviewPanel(props: {
  setTooltipProps: Dispatch<SetStateAction<ITooltip>>;
}) {
  const { setTooltipProps } = props;
  const componentTree = useStudioStore((store) =>
    store.actions.getComponentTree()
  );

  const pageExpressionSources = usePageExpressionSources();
  if (!componentTree) {
    return null;
  }

  return (
    <ComponentTreePreview
      componentTree={componentTree}
      expressionSources={pageExpressionSources}
      setTooltipProps={setTooltipProps}
    />
  );
}

function usePageExpressionSources() {
  const activeEntityData = useStudioStore((store) =>
    store.pages.getActiveEntityData()
  );
  const rawSiteSettings = useRawSiteSettings();
  const pageExpressionSources = useMemo(
    () => ({
      document: activeEntityData,
      siteSettings: rawSiteSettings,
    }),
    [activeEntityData, rawSiteSettings]
  );

  return pageExpressionSources;
}

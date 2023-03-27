import { TypeGuards, ComponentState } from "@yext/studio-plugin";
import { useMemo } from "react";
import useStudioStore from "../store/useStudioStore";
import { ExpressionSources, getPreviewProps } from "../utils/getPreviewProps";

/**
 * Gets the previewable props for the specified component, with any expressions
 * hydrated from the expression sources and parent item.
 */
export default function usePreviewProps(
  c: ComponentState | undefined,
  expressionSources: ExpressionSources,
  parentItem?: unknown
) {
  const getFileMetadata = useStudioStore(
    (store) => store.fileMetadatas.getFileMetadata
  );
  return useMemo(
    () =>
      c && TypeGuards.isStandardOrModuleComponentState(c)
        ? getPreviewProps(
            c.props,
            getFileMetadata(c.metadataUUID).propShape ?? {},
            {
              ...expressionSources,
              ...(parentItem !== undefined && { item: parentItem }),
            }
          )
        : {},
    [c, expressionSources, parentItem, getFileMetadata]
  );
}

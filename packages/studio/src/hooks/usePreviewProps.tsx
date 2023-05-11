import {
  TypeGuards,
  ComponentState,
  FileMetadataKind,
} from "@yext/studio-plugin";
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
  return useMemo(() => {
    if (!c || !TypeGuards.isStandardOrModuleComponentState(c)) {
      return {};
    }
    const fileMetadata = getFileMetadata(c.metadataUUID);
    if (fileMetadata?.kind === FileMetadataKind.Error) {
      return {};
    }

    return getPreviewProps(c.props, fileMetadata?.propShape ?? {}, {
      ...expressionSources,
      ...(parentItem !== undefined && { item: parentItem }),
    });
  }, [c, expressionSources, parentItem, getFileMetadata]);
}

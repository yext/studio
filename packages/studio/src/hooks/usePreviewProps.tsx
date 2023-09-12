import {
  ComponentState,
  FileMetadataKind,
  ComponentStateKind,
} from "@yext/studio-plugin";
import { useMemo } from "react";
import useStudioStore from "../store/useStudioStore";
import {
  ExpressionSources,
  getPropsForPreview,
} from "../utils/getPropsForPreview";

/**
 * Gets the previewable props for the specified component, with any expressions
 * hydrated from the expression sources.
 */
export default function usePreviewProps(
  c: ComponentState | undefined,
  expressionSources: ExpressionSources
): Record<string, unknown> {
  const getFileMetadata = useStudioStore(
    (store) => store.fileMetadatas.getFileMetadata
  );
  return useMemo(() => {
    if (c?.kind === ComponentStateKind.Error) {
      return Object.keys(c.props).reduce((prev, curr) => {
        prev[curr] = c.props[curr].value;
        return prev;
      }, {});
    }

    if (!c || c.kind !== ComponentStateKind.Standard) {
      return {};
    }

    const fileMetadata = getFileMetadata(c.metadataUUID);
    if (!fileMetadata || fileMetadata.kind === FileMetadataKind.Error) {
      throw new Error(
        `Cannot get propShape for FileMetadata of ${c.componentName}`
      );
    }

    return getPropsForPreview(c.props, fileMetadata?.propShape ?? {}, {
      ...expressionSources,
    });
  }, [c, expressionSources, getFileMetadata]);
}

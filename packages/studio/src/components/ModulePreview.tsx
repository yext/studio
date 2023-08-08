import { Dispatch, SetStateAction, useMemo } from "react";
import ComponentTreePreview from "./ComponentTreePreview";
import { ModuleState } from "@yext/studio-plugin";
import useStudioStore from "../store/useStudioStore";
import { ExpressionSources } from "../utils/getPropsForPreview";

export default function ModulePreview(props: {
  expressionSources: ExpressionSources;
  previewProps: Record<string, unknown>;
  moduleState: ModuleState;
  setTooltipProps: Dispatch<
    SetStateAction<{
      open: boolean;
      position: {
        x: number;
        y: number;
      };
      error: string;
      anchorId: string;
    }>
  >;
}) {
  const { expressionSources, previewProps, moduleState, setTooltipProps } =
    props;

  const getModuleMetadata = useStudioStore(
    (store) => store.fileMetadatas.getModuleMetadata
  );
  const componentTree = getModuleMetadata(
    moduleState.metadataUUID
  ).componentTree;

  const moduleExpressionSources = useMemo(
    () => ({
      ...expressionSources,
      props: previewProps,
    }),
    [expressionSources, previewProps]
  );

  return (
    <ComponentTreePreview
      componentTree={componentTree}
      expressionSources={moduleExpressionSources}
      setTooltipProps={setTooltipProps}
      renderHighlightingContainer={false}
    />
  );
}

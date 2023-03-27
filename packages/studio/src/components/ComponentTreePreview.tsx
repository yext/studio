import { useMemo } from "react";
import useStudioStore from "../store/useStudioStore";
import { ComponentTreeHelpers, ComponentState } from "@yext/studio-plugin";
import { ExpressionSources } from "../utils/getPreviewProps";
import ErrorBoundary from "./common/ErrorBoundary";
import useImportedComponents from "../hooks/useImportedComponents";
import HighlightingContainer from "./HighlightingContainer";
import ComponentPreview from "./ComponentPreview";

interface ComponentTreePreviewProps {
  componentTree: ComponentState[];
  expressionSources: ExpressionSources;
  renderHighlightingContainer?: boolean;
}

/**
 * Renders the provided component tree.
 */
export default function ComponentTreePreview({
  componentTree,
  expressionSources,
  renderHighlightingContainer = true,
}: ComponentTreePreviewProps): JSX.Element {
  useImportedComponents(componentTree);
  const elements = useComponentTreeElements(
    componentTree,
    expressionSources,
    renderHighlightingContainer
  );
  return <>{elements}</>;
}

/**
 * Renders the component tree with props, where expressions
 * in prop values are replace with actual values.
 */
function useComponentTreeElements(
  componentTree: ComponentState[],
  expressionSources: ExpressionSources,
  renderHighlightingContainer?: boolean
): (JSX.Element | null)[] | null {
  const UUIDToImportedComponent = useStudioStore(
    (store) => store.fileMetadatas.UUIDToImportedComponent
  );
  return useMemo(() => {
    // prevent logging errors on initial render before components are imported
    if (Object.keys(UUIDToImportedComponent).length === 0) {
      return null;
    }
    return ComponentTreeHelpers.mapComponentTree(
      componentTree,
      (c, children) => {
        const renderedComponent = (
          <ComponentPreview
            componentState={c}
            expressionSources={expressionSources}
            childElements={children}
          />
        );
        if (!renderHighlightingContainer) {
          return (
            <ErrorBoundary key={c.uuid}>{renderedComponent}</ErrorBoundary>
          );
        }
        return (
          <HighlightingContainer key={c.uuid} uuid={c.uuid}>
            <ErrorBoundary>{renderedComponent}</ErrorBoundary>
          </HighlightingContainer>
        );
      }
    );
  }, [
    UUIDToImportedComponent,
    componentTree,
    expressionSources,
    renderHighlightingContainer,
  ]);
}

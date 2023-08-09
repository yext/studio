import { Dispatch, SetStateAction, useMemo } from "react";
import { ComponentTreeHelpers, ComponentState } from "@yext/studio-plugin";
import { ExpressionSources } from "../utils/getPropsForPreview";
import ErrorBoundary from "./common/ErrorBoundary";
import HighlightingContainer from "./HighlightingContainer";
import ComponentPreview from "./ComponentPreview";
import { tooltipProps } from "./PreviewWithUseComponents";

interface ComponentTreePreviewProps {
  componentTree: ComponentState[];
  expressionSources: ExpressionSources;
  setTooltipProps: Dispatch<SetStateAction<tooltipProps>>;
  renderHighlightingContainer?: boolean;
}

/**
 * Renders the provided component tree.
 */
export default function ComponentTreePreview({
  componentTree,
  expressionSources,
  setTooltipProps,
  renderHighlightingContainer = true,
}: ComponentTreePreviewProps): JSX.Element {
  const elements = useComponentTreeElements(
    componentTree,
    expressionSources,
    setTooltipProps,
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
  setTooltipProps: Dispatch<SetStateAction<tooltipProps>>,
  renderHighlightingContainer?: boolean
): (JSX.Element | null)[] | null {
  return useMemo(() => {
    return ComponentTreeHelpers.mapComponentTree(
      componentTree,
      (c, children) => {
        const renderedComponent = (
          <ComponentPreview
            componentState={c}
            expressionSources={expressionSources}
            childElements={children}
            setTooltipProps={setTooltipProps}
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
    componentTree,
    expressionSources,
    renderHighlightingContainer,
    setTooltipProps,
  ]);
}

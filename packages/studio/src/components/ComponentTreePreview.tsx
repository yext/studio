import { useMemo, useState } from "react";
import useStudioStore from "../store/useStudioStore";
import {
  ComponentTreeHelpers,
  PropValues,
  ComponentState,
  transformPropValuesToRaw,
} from "@yext/studio-plugin";
import { useLayoutEffect } from "react";
import { ExpressionSources } from "../utils/getPreviewProps";
import ErrorBoundary from "./common/ErrorBoundary";
import useImportedComponents from "../hooks/useImportedComponents";
import HighlightingContainer from "./HighlightingContainer";
import ComponentPreview from "./ComponentPreview";

interface ComponentTreePreviewProps {
  componentTree: ComponentState[];
  parentProps?: PropValues;
  renderHighlightingContainer?: boolean;
}

/**
 * Renders the provided component tree.
 */
export default function ComponentTreePreview({
  componentTree,
  parentProps,
  renderHighlightingContainer = true,
}: ComponentTreePreviewProps): JSX.Element {
  useImportedComponents(componentTree);
  const expressionSources = useExpressionSources();
  const elements = useComponentTreeElements(
    componentTree,
    expressionSources,
    renderHighlightingContainer,
    parentProps
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
  renderHighlightingContainer?: boolean,
  parentProps?: PropValues
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
            parentProps={parentProps}
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
    parentProps,
    renderHighlightingContainer,
  ]);
}

/**
 * Dynamically load files that serve as expression sources for the
 * expressions in prop's value.
 */
function useExpressionSources(): ExpressionSources {
  const [expressionSources, setExpressionSources] = useState<ExpressionSources>(
    {}
  );
  const [siteSettingValues, activeEntityFile, isModuleBeingEdited] =
    useStudioStore((store) => [
      store.siteSettings.values,
      store.pages.activeEntityFile,
      !!store.pages.moduleUUIDBeingEdited,
    ]);

  useLayoutEffect(() => {
    const siteSettingsSource = siteSettingValues
      ? transformPropValuesToRaw(siteSettingValues)
      : {};
    setExpressionSources((prev) => ({
      ...prev,
      siteSettings: siteSettingsSource,
    }));
  }, [siteSettingValues]);

  const localDataPath = useStudioStore(
    (store) => store.studioConfig.paths.localData
  );

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
  }, [activeEntityFile, localDataPath, isModuleBeingEdited]);

  return expressionSources;
}

import { useMemo, useState } from "react";
import useStudioStore from "../store/useStudioStore";
import {
  ComponentTreeHelpers,
  PropValues,
  ComponentState,
  transformPropValuesToRaw,
  PropShape,
} from "@yext/studio-plugin";
import { useLayoutEffect } from "react";
import { getPreviewProps } from "../utils/getPreviewProps";
import ErrorBoundary from "./common/ErrorBoundary";
import useImportedComponents from "../hooks/useImportedComponents";
import HighlightingContainer from "./HighlightingContainer";
import ComponentPreview from "./ComponentPreview";

interface ComponentTreePreviewProps {
  componentTree: ComponentState[];
  props?: PropValues;
  propShape?: PropShape;
  isWithinModule?: boolean;
}

/**
 * Renders the provided component tree.
 */
export default function ComponentTreePreview({
  componentTree,
  props,
  propShape,
  isWithinModule,
}: ComponentTreePreviewProps): JSX.Element {
  useImportedComponents(componentTree);
  const elements = useComponentTreeElements(
    componentTree,
    props,
    propShape,
    isWithinModule
  );
  return <>{elements}</>;
}

/**
 * Renders the component tree with props, where expressions
 * in prop values are replace with actual values.
 */
function useComponentTreeElements(
  componentTree: ComponentState[],
  props?: PropValues,
  propShape?: PropShape,
  isWithinModule?: boolean
): (JSX.Element | null)[] | null {
  const UUIDToImportedComponent = useStudioStore(
    (store) => store.fileMetadatas.UUIDToImportedComponent
  );
  const expressionSources = useExpressionSources(props, propShape);
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
        if (isWithinModule) {
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
    expressionSources,
    componentTree,
    isWithinModule,
  ]);
}

/**
 * Dynamically load files that serve as expression sources for the
 * expressions in prop's value. Currently, Studio only support expression
 * value sourced from props, site settings file, or a Stream document.
 */
function useExpressionSources(
  props?: PropValues,
  propShape?: PropShape
): Record<string, Record<string, unknown>> {
  const [expressionSources, setExpressionSources] = useState<
    Record<string, Record<string, unknown>>
  >({});
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
    if (!activeEntityFile || isModuleBeingEdited) {
      return setExpressionSources((prev) => {
        const { document: _, ...otherSources } = prev;
        return otherSources;
      });
    }
    const entityFilepath = `${localDataPath}/${activeEntityFile}`;
    import(/* @vite-ignore */ entityFilepath).then((importedModule) => {
      setExpressionSources((prev) => ({
        ...prev,
        document: importedModule["default"] as Record<string, unknown>,
      }));
    });
  }, [activeEntityFile, localDataPath, isModuleBeingEdited]);

  useLayoutEffect(() => {
    setExpressionSources((prev) => {
      const { props: _, ...otherSources } = prev;
      if (!props || !propShape) {
        return otherSources;
      }
      const propsSource = getPreviewProps(props, propShape, otherSources);
      return {
        ...otherSources,
        props: propsSource,
      };
    });
  }, [props, propShape]);

  return expressionSources;
}

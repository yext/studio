import { Fragment, createElement, useMemo, useState } from "react";
import useStudioStore from "../store/useStudioStore";
import {
  ComponentTreeHelpers,
  ComponentStateKind,
  TypeGuards,
  FileMetadataKind,
  PropValues,
  ComponentState,
  transformPropValuesToRaw,
  PropShape,
  FileMetadata,
} from "@yext/studio-plugin";
import { ImportType } from "../store/models/ImportType";
import { useLayoutEffect } from "react";
import { ExpressionSources, getPreviewProps } from "../utils/getPreviewProps";
import ErrorBoundary from "./common/ErrorBoundary";
import useImportedComponents from "../hooks/useImportedComponents";
import HighlightingContainer from "./HighlightingContainer";

interface ComponentTreePreviewProps {
  componentTree: ComponentState[];
  parentProps?: PropValues;
  propShape?: PropShape;
  renderHighlightingContainer?: boolean;
  isModule?: boolean;
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
  const [UUIDToImportedComponent, UUIDToFileMetadata] = useStudioStore(
    (store) => [
      store.fileMetadatas.UUIDToImportedComponent,
      store.fileMetadatas.UUIDToFileMetadata,
    ]
  );
  return useMemo(() => {
    // prevent logging errors on initial render before components are imported
    if (Object.keys(UUIDToImportedComponent).length === 0) {
      return null;
    }

    return ComponentTreeHelpers.mapComponentTree(
      componentTree,
      (c, children) => {
        const renderedComponent = renderComponent(
          c,
          children,
          UUIDToFileMetadata,
          UUIDToImportedComponent,
          expressionSources,
          parentProps ?? {}
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
    UUIDToFileMetadata,
    expressionSources,
    parentProps,
    renderHighlightingContainer,
  ]);
}

function renderComponent(
  c: ComponentState,
  children: (JSX.Element | null)[],
  UUIDToFileMetadata: Record<string, FileMetadata>,
  UUIDToImportedComponent: Record<string, ImportType>,
  expressionSources: ExpressionSources,
  parentProps: PropValues
) {
  let element: ImportType | string;
  if (c.kind === ComponentStateKind.Fragment) {
    element = Fragment;
  } else if (c.kind === ComponentStateKind.BuiltIn) {
    element = c.componentName;
  } else {
    const metadata = UUIDToFileMetadata[c.metadataUUID];
    if (metadata && metadata.kind === FileMetadataKind.Module) {
      return (
        <ComponentTreePreview
          componentTree={metadata.componentTree}
          parentProps={c.props}
          propShape={metadata.propShape}
          renderHighlightingContainer={false}
          key={c.uuid}
          isModule={true}
        />
      );
    } else if (!UUIDToImportedComponent[c.metadataUUID]) {
      console.warn(
        `Expected to find component loaded for ${c.componentName} but none found - possibly due to a race condition.`
      );
      return null;
    }
    element = UUIDToImportedComponent[c.metadataUUID];
  }
  const previewProps = TypeGuards.isStandardOrModuleComponentState(c)
    ? getPreviewProps(
        c.props,
        UUIDToFileMetadata[c.metadataUUID].propShape ?? {},
        expressionSources,
        parentProps
      )
    : {};
  return createElement(
    element,
    {
      ...previewProps,
      key: c.uuid,
    },
    ...children
  );
}

/**
 * Dynamically load files that serve as expression sources for the
 * expressions in prop's value. Currently, Studio only support expression
 * value sourced from props, site settings file, or a Stream document.
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

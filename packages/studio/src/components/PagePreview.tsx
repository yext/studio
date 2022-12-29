import {
  Fragment,
  FunctionComponent,
  createElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import useStudioStore from "../store/useStudioStore";
import {
  ComponentState,
  ComponentTreeHelpers,
  ComponentStateKind,
  PageState,
  TypeGuards,
} from "@yext/studio-plugin";
import { ImportType } from "../store/models/ImportType";
import { useLayoutEffect } from "react";
import { getPreviewProps } from "../utils/getPreviewProps";
import ErrorBoundary from "./common/ErrorBoundary";

interface PagePreviewProps {
  pageState: PageState
}

/**
 * Renders the provided page's component tree.
 */
export default function PagePreview({ pageState }: PagePreviewProps): JSX.Element {
  useImportedComponents(pageState);
  const elements = usePageElements(pageState);
  return <>{elements}</>;
}

/**
 * Renders the page's component tree with props, where expressions
 * in prop values are replace with actual values.
 */
function usePageElements(pageState: PageState): (JSX.Element | null)[] | null {
  const UUIDToImportedComponent = useStudioStore(
    (store) => store.fileMetadatas.UUIDToImportedComponent
  );
  const expressionSources = useExpressionSources();
  return useMemo(() => {
    // prevent logging errors on initial render before components are imported
    if (Object.keys(UUIDToImportedComponent).length === 0) {
      return null;
    }
    return ComponentTreeHelpers.mapComponentTree(
      pageState.componentTree,
      (c, children) => {
        let element: ImportType | string;
        if (c.kind === ComponentStateKind.Fragment) {
          element = Fragment;
        } else if (c.kind === ComponentStateKind.BuiltIn) {
          element = c.componentName;
        } else {
          if (!UUIDToImportedComponent[c.metadataUUID]) {
            console.warn(
              `Expected to find component loaded for ${c.componentName} but none found - possibly due to a race condition.`
            );
            return null;
          }
          element = UUIDToImportedComponent[c.metadataUUID];
        }

        const previewProps =
          c.kind === ComponentStateKind.Fragment
            ? {}
            : getPreviewProps(c.props, expressionSources);
        const component = createElement(
          element,
          {
            ...previewProps,
            key: c.uuid,
          },
          ...children
        );

        return (
          <ErrorBoundary key={c.uuid}>
            <div>{component}</div>
          </ErrorBoundary>
        );
      }
    );
  }, [UUIDToImportedComponent, expressionSources, pageState]);
}

/**
 * Dynamically load files that serve as expression sources for the
 * expressions in prop's value. Currently, Studio only support expression
 * value sourced from site settings file or a Stream document.
 */
function useExpressionSources(): Record<string, Record<string, unknown>> {
  const [expressionSources, setExpressionSources] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const siteSettingValues = useStudioStore(
    (store) => store.siteSettings.values
  );
  useLayoutEffect(() => {
    const siteSettingsSource = Object.entries(siteSettingValues ?? {}).reduce(
      (map, [propName, proVal]) => {
        map[propName] = proVal.value;
        return map;
      },
      {}
    );
    setExpressionSources((prev) => ({
      ...prev,
      siteSettings: siteSettingsSource,
    }));
  }, [siteSettingValues]);
  return expressionSources;
}

/**
 * Load all functional component methods correspond to the components
 * and modules use in the provided page state's component tree.
 */
function useImportedComponents(pageState: PageState) {
  const UUIDToFileMetadata = useStudioStore(
    (store) => store.fileMetadatas.UUIDToFileMetadata
  );
  const setUUIDToImportedComponent = useStudioStore(
    (store) => store.fileMetadatas.setUUIDToImportedComponent
  );

  // Use ref instead of to avoid triggering rerender (infinite loop) in useCallback/useLayoutEffect logic
  const UUIDToImportedComponentRef = useRef<Record<string, ImportType>>(
    useStudioStore((store) => store.fileMetadatas.UUIDToImportedComponent)
  );

  const importComponent = useCallback(
    async (
      c: ComponentState,
      newImportedComponents: Record<string, ImportType>
    ) => {
      if (!TypeGuards.isStandardOrModuleComponentState(c)) {
        return null;
      }
      const { metadataUUID, componentName } = c;
      // Avoid re-importing components
      if (metadataUUID in UUIDToImportedComponentRef) {
        return null;
      }
      const filepath = UUIDToFileMetadata[metadataUUID].filepath;
      const importedModule = await import(filepath);
      const functionComponent = getFunctionComponent(
        importedModule,
        componentName
      );
      if (functionComponent) {
        newImportedComponents[metadataUUID] = functionComponent;
      }
    },
    [UUIDToFileMetadata]
  );

  useLayoutEffect(() => {
    const newLoadedComponents: Record<string, ImportType> = {};
    Promise.all([
      ...pageState.componentTree.map((c) =>
        importComponent(c, newLoadedComponents)
      ),
    ]).then(() => {
      const newState = {
        ...UUIDToImportedComponentRef.current,
        ...newLoadedComponents,
      };
      UUIDToImportedComponentRef.current = newState;
      setUUIDToImportedComponent(newState);
    });
  }, [importComponent, pageState, setUUIDToImportedComponent]);
}

function getFunctionComponent(
  module: Record<string, unknown>,
  name: string
): ImportType | null {
  if (typeof module[name] === "function") {
    return module[name] as FunctionComponent;
  } else if (typeof module["default"] === "function") {
    return module["default"] as FunctionComponent;
  } else {
    console.error(`${name} is not a valid functional component.`);
    return null;
  }
}

// studio/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path6 from "path";

// studio/studio-plugin/ts-morph/parseComponentMetadata.ts
import { ts as ts3 } from "ts-morph";

// studio/studio-plugin/ts-morph/common.ts
import { ts, Project } from "ts-morph";
import typescript from "typescript";
import prettier from "prettier";
import fs from "fs";

// studio/types.ts
var specialTypesArray = ["HexColor", "StreamsTemplateString", "StreamsDataPath"];

// studio/studio-plugin/ts-morph/parseImports.ts
import { SyntaxKind } from "ts-morph";
function parseImports(file) {
  const sourceFile = typeof file === "string" ? getSourceFile(file) : file;
  const importPathToImportNames = {};
  sourceFile.getDescendantsOfKind(SyntaxKind.ImportDeclaration).forEach((importDeclaration) => {
    var _a;
    const importClause = importDeclaration.getFirstDescendantByKind(SyntaxKind.ImportClause);
    if (!importClause) {
      return;
    }
    const defaultImport = (_a = importClause.getDefaultImport()) == null ? void 0 : _a.getText();
    const namedImports = importClause.getNamedImports().map((n) => n.compilerNode.name.escapedText.toString());
    const importPath = importDeclaration.getModuleSpecifierValue();
    if (!importPathToImportNames[importPath]) {
      importPathToImportNames[importPath] = [];
    }
    importPathToImportNames[importPath].push(...namedImports);
    defaultImport && importPathToImportNames[importPath].push(defaultImport);
  });
  return importPathToImportNames;
}

// studio/studio-plugin/ts-morph/common.ts
import { resolve } from "path";
var __vite_injected_original_dirname = "/Users/oshi/studio-prototype/studio/studio-plugin/ts-morph";
var { JsxEmit, resolveModuleName } = typescript;
function getComponentNodes(parentNode) {
  const nodes = parentNode.getDescendants().filter((n) => {
    return n.isKind(ts.SyntaxKind.JsxOpeningElement) || n.isKind(ts.SyntaxKind.JsxSelfClosingElement);
  });
  return nodes;
}
var tsCompilerOptions = {
  compilerOptions: {
    jsx: JsxEmit.ReactJSX
  }
};
function getComponentName(n) {
  return n.getTagNameNode().getText();
}
function prettify(code) {
  return prettier.format(code, {
    parser: "typescript",
    semi: false,
    singleQuote: true,
    jsxSingleQuote: true
  });
}
function getPropName(n) {
  var _a;
  return (_a = n.getFirstDescendantByKind(ts.SyntaxKind.Identifier)) == null ? void 0 : _a.compilerNode.text;
}
function getJsxAttributeValue(n) {
  const initializer = n.getInitializerOrThrow();
  if (initializer.isKind(ts.SyntaxKind.StringLiteral)) {
    return initializer.compilerNode.text;
  }
  const expression = initializer.getExpressionOrThrow();
  if (expression.isKind(ts.SyntaxKind.PropertyAccessExpression) || expression.isKind(ts.SyntaxKind.TemplateExpression)) {
    return expression.getText();
  } else if (expression.isKind(ts.SyntaxKind.NumericLiteral) || expression.isKind(ts.SyntaxKind.FalseKeyword) || expression.isKind(ts.SyntaxKind.TrueKeyword)) {
    return expression.getLiteralValue();
  } else {
    throw new Error("Unrecognized Expression kind: " + expression.getKindName());
  }
}
function getPropValue(n) {
  const stringNode = n.getFirstDescendantByKind(ts.SyntaxKind.StringLiteral);
  if (stringNode) {
    return stringNode.compilerNode.text;
  }
  if (n.getFirstDescendantByKind(ts.SyntaxKind.TrueKeyword))
    return true;
  if (n.getFirstDescendantByKind(ts.SyntaxKind.FalseKeyword))
    return false;
  const numberNode = n.getFirstDescendantByKind(ts.SyntaxKind.NumericLiteral);
  if (numberNode) {
    return parseFloat(numberNode.compilerNode.text);
  }
  const templateExpression = n.getFirstDescendantByKind(ts.SyntaxKind.TemplateExpression);
  if (templateExpression) {
    const templateStringIncludingBacktiks = templateExpression.getFullText();
    return templateStringIncludingBacktiks.substring(1, templateStringIncludingBacktiks.length - 1);
  }
  throw new Error("unhandled prop value for node: " + n.getFullText() + " with kind: " + n.getKindName());
}
function parsePropertyStructures(properties, filePath) {
  const props = {};
  let imports;
  properties.forEach((p) => {
    var _a;
    const jsdoc = (_a = p.docs) == null ? void 0 : _a.map((doc) => typeof doc === "string" ? doc : doc.description).join("\n");
    if (isPropType(p.type)) {
      if (["string", "number", "boolean"].includes(p.type) || validateProp(p.type)) {
        props[p.name] = {
          type: p.type,
          ...jsdoc && { doc: jsdoc }
        };
      }
    } else {
      console.error(`Prop type ${p.type} is not recognized. Skipping gracefully.`);
    }
  });
  return props;
  function validateProp(type) {
    if (!imports) {
      imports = parseImports(filePath);
    }
    if (["string", "boolean", "number"].includes(type)) {
      return true;
    }
    const isValidProp = !!Object.entries(imports).find(([path7, names]) => {
      if (names.some((name) => name === type)) {
        return resolve(filePath, "..", path7) === resolve(__vite_injected_original_dirname, "../../types");
      }
      return false;
    });
    if (!isValidProp) {
      console.error(`Skipping prop type ${type} because it was not imported from the Studio's types.ts.`);
    }
    return isValidProp;
  }
  function isPropType(type) {
    const types = ["string", "number", "boolean"].concat(specialTypesArray);
    return types.some((t) => t === type);
  }
}
function resolveNpmModule(moduleName) {
  const customModuleResolutionHost = {
    fileExists(fileName) {
      return fs.existsSync(resolveTsFileName(fileName));
    },
    readFile(fileName) {
      return fs.readFileSync(resolveTsFileName(fileName), "utf-8");
    }
  };
  const { resolvedModule } = resolveModuleName(moduleName, "", {}, customModuleResolutionHost);
  if (!resolvedModule) {
    throw new Error(`Could not resolve module: "${moduleName}"`);
  }
  const absPath = resolveTsFileName(resolvedModule.resolvedFileName);
  return absPath;
  function resolveTsFileName(fileName) {
    return resolve(__vite_injected_original_dirname, "../../..", fileName);
  }
}
function getSourceFile(file) {
  const p = new Project(tsCompilerOptions);
  p.addSourceFilesAtPaths(file);
  return p.getSourceFileOrThrow(file);
}
function getDefaultExport(sourceFile) {
  const declarations = sourceFile.getDefaultExportSymbolOrThrow().getDeclarations();
  if (declarations.length === 0) {
    throw new Error("Error getting default export");
  }
  const node = declarations[0];
  if (node.isKind(ts.SyntaxKind.ExportAssignment)) {
    const identifierName = node.getFirstDescendantByKindOrThrow(ts.SyntaxKind.Identifier).getText();
    return sourceFile.getVariableDeclarationOrThrow(identifierName);
  } else if (node.isKind(ts.SyntaxKind.FunctionDeclaration)) {
    return node;
  }
  throw new Error("Error getting default export, no ExportAssignment or FunctionDeclaration found");
}

// studio/studio-plugin/ts-morph/parseComponentMetadata.ts
import path from "path";

// studio/studio-plugin/ts-morph/parseInitialProps.ts
import { ts as ts2 } from "ts-morph";
function parseInitialProps(sourceFile) {
  var _a;
  const props = {};
  const initialPropsSymbol = sourceFile.getExportSymbols().find((s) => s.compilerSymbol.escapedName === "initialProps");
  if (!initialPropsSymbol) {
    return props;
  }
  const initialProps = (_a = initialPropsSymbol == null ? void 0 : initialPropsSymbol.getValueDeclaration()) == null ? void 0 : _a.getFirstDescendantByKind(ts2.SyntaxKind.ObjectLiteralExpression);
  if (!initialProps) {
    return props;
  }
  initialProps.getDescendants().forEach((d) => {
    const propName = getPropName(d);
    if (!propName) {
      return;
    }
    props[propName] = getPropValue(d);
  });
  return props;
}

// studio/studio-plugin/ts-morph/parseComponentMetadata.ts
var __vite_injected_original_dirname2 = "/Users/oshi/studio-prototype/studio/studio-plugin/ts-morph";
var pathToPagePreview = path.resolve(__vite_injected_original_dirname2, "../../client/components/PagePreview");
function parseComponentMetadata(sourceFile, filePath, interfaceName, importIdentifier) {
  const propsInterface = sourceFile.getDescendantsOfKind(ts3.SyntaxKind.InterfaceDeclaration).find((n) => {
    return n.getName() === interfaceName;
  });
  if (!propsInterface) {
    throw new Error(`No interface found with name "${interfaceName}" in file "${filePath}"`);
  }
  const properties = propsInterface.getStructure().properties ?? [];
  return {
    propShape: parsePropertyStructures(properties, filePath),
    initialProps: parseInitialProps(sourceFile),
    editable: true,
    importIdentifier: getImportIdentifier()
  };
  function getImportIdentifier() {
    if (importIdentifier)
      return importIdentifier;
    return path.relative(pathToPagePreview, filePath);
  }
}

// studio/studio-plugin/ts-morph/parseSiteSettingsFile.ts
import { ts as ts4 } from "ts-morph";

// studio/studio-plugin/getRootPath.ts
import path2 from "path";
var __vite_injected_original_dirname3 = "/Users/oshi/studio-prototype/studio/studio-plugin";
var rootPath = path2.resolve(__vite_injected_original_dirname3, "../..");
function getRootPath(srcPath) {
  return path2.join(rootPath, srcPath);
}

// studio/studio-plugin/ts-morph/parseSiteSettingsFile.ts
function parseSiteSettingsFile(filePath, interfaceName) {
  const file = getRootPath(filePath);
  const sourceFile = getSourceFile(file);
  const siteSettingsNode = sourceFile.getDescendantsOfKind(ts4.SyntaxKind.ObjectLiteralExpression).find((n) => {
    var _a, _b;
    return ((_b = (_a = n.getContextualType()) == null ? void 0 : _a.getSymbol()) == null ? void 0 : _b.getName()) === interfaceName;
  });
  if (!siteSettingsNode) {
    throw new Error(`unable to find site settings object of type ${interfaceName} in filepath ${filePath}`);
  }
  const propState = {};
  siteSettingsNode.getProperties().filter((p) => p.isKind(ts4.SyntaxKind.PropertyAssignment)).forEach((p) => propState[p.getName()] = getPropValue(p));
  return propState;
}

// studio/studio-plugin/ts-morph/parsePageFile.ts
import { ts as ts5 } from "ts-morph";
import { v1 } from "uuid";
function parseLayoutState(sourceFile, imports) {
  const defaultExport = getDefaultExport(sourceFile);
  const returnStatement = defaultExport.getFirstDescendantByKind(ts5.SyntaxKind.ReturnStatement);
  if (!returnStatement) {
    throw new Error("No return statement found for page");
  }
  const JsxNodeWrapper = returnStatement.getFirstChildByKind(ts5.SyntaxKind.ParenthesizedExpression) ?? returnStatement;
  const topLevelJsxNode = JsxNodeWrapper.getChildren().find((n) => n.getKind() === ts5.SyntaxKind.JsxElement || n.getKind() === ts5.SyntaxKind.JsxFragment);
  if (!topLevelJsxNode) {
    throw new Error("Unable to find top level JSX element or JsxFragment type from file.");
  }
  let layoutState;
  if (topLevelJsxNode.getKind() === ts5.SyntaxKind.JsxElement) {
    const name = getComponentName(topLevelJsxNode.getOpeningElement());
    layoutState = {
      name,
      props: {},
      uuid: v1()
    };
    const isBuiltinJsxElement = name.charAt(0) === name.charAt(0).toLowerCase();
    if (!isBuiltinJsxElement && !["Fragment", "React.Fragment"].includes(name)) {
      layoutState.moduleName = getComponentModuleName(name, imports);
    }
  } else {
    layoutState = {
      name: "",
      props: {},
      uuid: v1()
    };
  }
  return {
    layoutState,
    layoutNode: topLevelJsxNode
  };
}
function parsePageFile(filePath) {
  const sourceFile = getSourceFile(filePath);
  const imports = parseImports(sourceFile);
  const { layoutState, layoutNode } = parseLayoutState(sourceFile, imports);
  const usedComponents = getComponentNodes(layoutNode);
  const layoutJsxOpeningElement = layoutNode.getKind() === ts5.SyntaxKind.JsxElement ? layoutNode.getOpeningElement() : layoutNode.getOpeningFragment();
  const componentsState = [];
  usedComponents.forEach((n) => {
    if (n === layoutJsxOpeningElement) {
      return;
    }
    const name = getComponentName(n);
    const componentData = {
      name,
      props: {},
      uuid: v1(),
      moduleName: getComponentModuleName(name, imports)
    };
    n.getDescendantsOfKind(ts5.SyntaxKind.JsxAttribute).forEach((jsxAttribute) => {
      const propName = getPropName(jsxAttribute);
      if (!propName) {
        throw new Error("Could not parse jsx attribute prop name: " + jsxAttribute.getFullText());
      }
      const propValue = getJsxAttributeValue(jsxAttribute);
      componentData.props[propName] = propValue;
    });
    componentsState.push(componentData);
  });
  return {
    layoutState,
    componentsState
  };
}
function getComponentModuleName(name, imports) {
  let moduleName = Object.keys(imports).find((importIdentifier) => {
    const importedNames = imports[importIdentifier];
    return importedNames.includes(name);
  });
  if (!moduleName) {
    throw new Error(`Could not find import path/module for component "${name}"`);
  }
  if (moduleName.startsWith(".")) {
    moduleName = "localComponents";
  }
  return moduleName;
}

// studio/studio-plugin/ts-morph/updatePageFile.ts
import fs3 from "fs";
import { ts as ts7 } from "ts-morph";

// src/studio.ts
var studio_default = {
  npmComponents: {
    "@yext/search-ui-react": ["SearchBar", "UniversalResults"]
  },
  dirs: {
    pagesDir: "./src/templates"
  }
};

// studio/studio-plugin/ts-morph/parseNpmComponents.ts
import { ts as ts6 } from "ts-morph";
import path3 from "path";
function parseNpmComponents(moduleName, matchers) {
  const absPath = resolveNpmModule(moduleName);
  const sourceFile = getSourceFile(absPath);
  const importIdentifier = path3.resolve("/src/search-ui-react-reexport.ts");
  const errorMetadataValue = {
    propShape: {},
    initialProps: {},
    editable: false,
    importIdentifier
  };
  const componentsToProps = {};
  sourceFile.getDescendantStatements().forEach((n) => {
    if (!n.isKind(ts6.SyntaxKind.FunctionDeclaration)) {
      return;
    }
    const componentName = n.getName();
    if (!componentName || !testComponentName(componentName, matchers)) {
      return;
    }
    const parameters = n.getParameters();
    if (parameters.length !== 1) {
      if (parameters.length > 1) {
        console.error(`Found ${parameters.length} number of arguments for functional component ${componentName}, expected only 1. Ignoring this component's props.`);
      }
      componentsToProps[componentName] = errorMetadataValue;
      return;
    }
    const typeNode = parameters[0].getTypeNode();
    if (!typeNode) {
      console.error(`No type information found for "${componentName}"'s props. Ignoring this component's props.`);
      componentsToProps[componentName] = errorMetadataValue;
      return;
    }
    if (typeNode.isKind(ts6.SyntaxKind.TypeLiteral)) {
      const properties = typeNode.getProperties().map((p) => p.getStructure());
      const propShape = parsePropertyStructures(properties, absPath);
      componentsToProps[componentName] = {
        propShape,
        initialProps: {},
        importIdentifier,
        editable: true
      };
    } else if (typeNode.isKind(ts6.SyntaxKind.TypeReference)) {
      try {
        const typeName = typeNode.getTypeName().getText();
        const componentMetadata = parseComponentMetadata(sourceFile, absPath, typeName, importIdentifier);
        componentsToProps[componentName] = componentMetadata;
      } catch (err) {
        console.error("Caught an error, likely with regards to nested interfaces. Ignoring props for ", componentName);
        console.error(err);
        componentsToProps[componentName] = errorMetadataValue;
      }
    } else {
      console.error(`Unhandled parameter type "${typeNode.getKindName()}" found for "${componentName}". Ignoring this component's props.`);
      componentsToProps[componentName] = errorMetadataValue;
    }
  });
  return componentsToProps;
}
function firstCharacterIsUpperCase(componentName) {
  return componentName[0] === componentName[0].toUpperCase();
}
function testComponentName(componentName, matchers) {
  if (!firstCharacterIsUpperCase(componentName)) {
    return false;
  }
  for (const m of matchers) {
    if (typeof m === "string") {
      if (m === componentName) {
        return true;
      }
    } else {
      if (m.test(componentName)) {
        return true;
      }
    }
  }
  return false;
}

// studio/studio-plugin/componentMetadata.ts
import fs2 from "fs";
import path4 from "path";
var npmComponentProps = Object.keys(studio_default["npmComponents"]).reduce((shapes, moduleName) => {
  const matchers = studio_default.npmComponents[moduleName];
  shapes[moduleName] = parseNpmComponents(moduleName, matchers);
  return shapes;
}, {});
var localComponents = fs2.readdirSync(getRootPath("src/components"), "utf-8").reduce((prev, curr) => {
  const componentName = curr.substring(0, curr.lastIndexOf("."));
  prev[componentName] = parseComponentMetadata(getSourceFile(getRootPath(`src/components/${curr}`)), getRootPath(`src/components/${curr}`), `${componentName}Props`);
  return prev;
}, {});
var localLayouts = fs2.readdirSync(getRootPath("src/layouts"), "utf-8").reduce((prev, curr) => {
  const componentName = curr.substring(0, curr.lastIndexOf("."));
  prev[componentName] = {
    editable: false,
    importIdentifier: path4.relative(pathToPagePreview, getRootPath(`src/layouts/${curr}`))
  };
  return prev;
}, {});
var moduleNameToComponentMetadata = {
  localComponents,
  ...localLayouts,
  ...npmComponentProps
};

// studio/studio-plugin/ts-morph/updatePageFile.ts
function updatePageFile(updatedState, pageFilePath) {
  const sourceFile = getSourceFile(pageFilePath);
  const defaultExport = getDefaultExport(sourceFile);
  const pageComponent = getPageComponentFunction(defaultExport);
  const returnStatementIndex = pageComponent.getDescendantStatements().findIndex((n) => {
    return n.isKind(ts7.SyntaxKind.ReturnStatement);
  });
  if (returnStatementIndex < 0) {
    throw new Error(`No return statement found at page: "${pageFilePath}"`);
  }
  pageComponent.removeStatement(returnStatementIndex);
  pageComponent.addStatements(createReturnStatement(updatedState));
  const updatedFileText = prettify(sourceFile.getFullText());
  fs3.writeFileSync(pageFilePath, updatedFileText);
}
function getPageComponentFunction(defaultExport) {
  if (defaultExport.isKind(ts7.SyntaxKind.VariableDeclaration)) {
    const arrowFunction = defaultExport.getFirstDescendantByKindOrThrow(ts7.SyntaxKind.ArrowFunction);
    return arrowFunction;
  } else if (defaultExport.isKind(ts7.SyntaxKind.FunctionDeclaration)) {
    return defaultExport;
  }
  throw new Error("Unhandled page component type: " + defaultExport.getKindName());
}
function createReturnStatement(updatedState) {
  const elements = updatedState.componentsState.reduce((prev, next) => {
    if (!next.moduleName) {
      return prev;
    }
    const componentMetadata = moduleNameToComponentMetadata[next.moduleName][next.name];
    if (!componentMetadata.propShape) {
      return prev;
    }
    return prev + "\n" + createJsxSelfClosingElement(next.name, componentMetadata.propShape, next.props);
  }, "");
  const layoutComponentName = updatedState.layoutState.name;
  return `return (
<${layoutComponentName}>
${elements}
</${layoutComponentName}>
)`;
}
function createJsxSelfClosingElement(elementName, propShape, props) {
  let el = `<${elementName} `;
  Object.keys(props).forEach((propName) => {
    const propType = propShape[propName].type;
    const val = props[propName];
    if (propType === "StreamsTemplateString") {
      el += `${propName}={\`${val}\`}`;
    } else if (propType === "string" || propType === "HexColor") {
      el += `${propName}='${val}' `;
    } else {
      el += `${propName}={${val}} `;
    }
  });
  el += "/>";
  return el;
}

// studio/studio-plugin/ts-morph/updateSiteSettingsFile.ts
import fs4 from "fs";
import { ts as ts8 } from "ts-morph";
function updateSiteSettingsFile(updatedState, pageFilePath) {
  const file = getRootPath(pageFilePath);
  const sourceFile = getSourceFile(file);
  const siteSettingsNode = sourceFile.getDescendantsOfKind(ts8.SyntaxKind.ObjectLiteralExpression).find((n) => {
    var _a, _b;
    return ((_b = (_a = n.getContextualType()) == null ? void 0 : _a.getSymbol()) == null ? void 0 : _b.getName()) === "SiteSettings";
  });
  if (!siteSettingsNode) {
    throw new Error(`No site settings object found at "${pageFilePath}"`);
  }
  siteSettingsNode.getProperties().filter((p) => p.isKind(ts8.SyntaxKind.PropertyAssignment)).forEach((p) => {
    const propName = p.getName();
    const propNewValue = updatedState[propName];
    siteSettingsNode.addPropertyAssignment({
      name: propName,
      initializer: typeof propNewValue === "string" ? `'${propNewValue}'` : propNewValue.toString()
    });
    p.remove();
  });
  const updatedFileText = prettify(sourceFile.getFullText());
  fs4.writeFileSync(pageFilePath, updatedFileText);
}

// studio/studio-plugin/getPagePath.ts
import path5 from "path";
function getPagePath(pageFile) {
  var _a;
  const pathFromSrc = path5.join(((_a = studio_default.dirs) == null ? void 0 : _a.pagesDir) ?? "./src/pages", pageFile);
  return getRootPath(pathFromSrc);
}

// studio/studio-plugin/configureServer.ts
function configureStudioServer(server) {
  function registerListener(messageId, listener) {
    const handleRes = (data, client) => {
      try {
        const msg = listener(data);
        sendClientMsg(client, messageId, { type: "success", msg });
      } catch (e) {
        const msg = e.toString();
        console.error(e);
        sendClientMsg(client, messageId, { type: "error", msg });
      }
    };
    server.ws.on(messageId, handleRes);
  }
  registerListener("studio:UpdatePageComponentProps" /* UpdatePageComponentProps */, (data) => {
    const pagePath = getPagePath(data.pageFile);
    updatePageFile(data.state, pagePath);
    return "successfully edited: " + pagePath;
  });
  registerListener("studio:UpdateSiteSettingsProps" /* UpdateSiteSettingsProps */, (data) => {
    updateSiteSettingsFile(data.state, data.path);
    return "successfully edited: " + data.path;
  });
}
function sendClientMsg(client, messageId, payload) {
  client.send(messageId, payload);
}

// studio/studio-plugin/createStudioPlugin.ts
import openBrowser from "react-dev-utils/openBrowser.js";
function createStudioPlugin(args) {
  const virtualModuleId = "virtual:yext-studio";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  const ctx = {
    siteSettings: {
      componentMetadata: parseComponentMetadata(getSourceFile(getRootPath("src/siteSettings.ts")), getRootPath("src/siteSettings.ts"), "SiteSettings"),
      propState: parseSiteSettingsFile("src/siteSettings.ts", "SiteSettings")
    },
    moduleNameToComponentMetadata,
    componentsOnPage: {
      index: parsePageFile(getPagePath("index.tsx"))
    }
  };
  return {
    name: "yext-studio-vite-plugin",
    async buildStart() {
      if (args.mode === "development" && args.command === "serve") {
        openBrowser("http://localhost:3000/studio/client/");
      }
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(ctx)}`;
      }
    },
    configureServer: configureStudioServer
  };
}

// studio/vite.config.ts
var __vite_injected_original_dirname4 = "/Users/oshi/studio-prototype/studio";
var vite_config_default = defineConfig((args) => {
  return {
    plugins: [
      react(),
      createStudioPlugin(args)
    ],
    root: path6.resolve(__vite_injected_original_dirname4, ".."),
    server: {
      port: 3e3
    },
    build: {
      rollupOptions: {
        input: "/studio/client/index.html"
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3R1ZGlvL3ZpdGUuY29uZmlnLnRzIiwgInN0dWRpby9zdHVkaW8tcGx1Z2luL3RzLW1vcnBoL3BhcnNlQ29tcG9uZW50TWV0YWRhdGEudHMiLCAic3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGgvY29tbW9uLnRzIiwgInN0dWRpby90eXBlcy50cyIsICJzdHVkaW8vc3R1ZGlvLXBsdWdpbi90cy1tb3JwaC9wYXJzZUltcG9ydHMudHMiLCAic3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGgvcGFyc2VJbml0aWFsUHJvcHMudHMiLCAic3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGgvcGFyc2VTaXRlU2V0dGluZ3NGaWxlLnRzIiwgInN0dWRpby9zdHVkaW8tcGx1Z2luL2dldFJvb3RQYXRoLnRzIiwgInN0dWRpby9zdHVkaW8tcGx1Z2luL3RzLW1vcnBoL3BhcnNlUGFnZUZpbGUudHMiLCAic3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGgvdXBkYXRlUGFnZUZpbGUudHMiLCAic3JjL3N0dWRpby50cyIsICJzdHVkaW8vc3R1ZGlvLXBsdWdpbi90cy1tb3JwaC9wYXJzZU5wbUNvbXBvbmVudHMudHMiLCAic3R1ZGlvL3N0dWRpby1wbHVnaW4vY29tcG9uZW50TWV0YWRhdGEudHMiLCAic3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGgvdXBkYXRlU2l0ZVNldHRpbmdzRmlsZS50cyIsICJzdHVkaW8vc3R1ZGlvLXBsdWdpbi9nZXRQYWdlUGF0aC50cyIsICJzdHVkaW8vc3R1ZGlvLXBsdWdpbi9jb25maWd1cmVTZXJ2ZXIudHMiLCAic3R1ZGlvL3N0dWRpby1wbHVnaW4vY3JlYXRlU3R1ZGlvUGx1Z2luLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL29zaGkvc3R1ZGlvLXByb3RvdHlwZS9zdHVkaW9cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgY3JlYXRlU3R1ZGlvUGx1Z2luIGZyb20gJy4vc3R1ZGlvLXBsdWdpbi9jcmVhdGVTdHVkaW9QbHVnaW4nXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhhcmdzID0+IHtcbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICByZWFjdCgpLFxuICAgICAgY3JlYXRlU3R1ZGlvUGx1Z2luKGFyZ3MpXG4gICAgXSxcbiAgICByb290OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4nKSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIHBvcnQ6IDMwMDBcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIGlucHV0OiAnL3N0dWRpby9jbGllbnQvaW5kZXguaHRtbCcsXG4gICAgICB9LFxuICAgIH1cbiAgfVxufSlcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL29zaGkvc3R1ZGlvLXByb3RvdHlwZS9zdHVkaW8vc3R1ZGlvLXBsdWdpbi90cy1tb3JwaFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL29zaGkvc3R1ZGlvLXByb3RvdHlwZS9zdHVkaW8vc3R1ZGlvLXBsdWdpbi90cy1tb3JwaC9wYXJzZUNvbXBvbmVudE1ldGFkYXRhLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGgvcGFyc2VDb21wb25lbnRNZXRhZGF0YS50c1wiO2ltcG9ydCB7IENvbXBvbmVudE1ldGFkYXRhIH0gZnJvbSAnLi4vLi4vc2hhcmVkL21vZGVscydcbmltcG9ydCB7IHRzLCBTb3VyY2VGaWxlIH0gZnJvbSAndHMtbW9ycGgnXG5pbXBvcnQgeyBwYXJzZVByb3BlcnR5U3RydWN0dXJlcyB9IGZyb20gJy4vY29tbW9uJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBwYXJzZUluaXRpYWxQcm9wcyBmcm9tICcuL3BhcnNlSW5pdGlhbFByb3BzJ1xuXG5leHBvcnQgY29uc3QgcGF0aFRvUGFnZVByZXZpZXcgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vY2xpZW50L2NvbXBvbmVudHMvUGFnZVByZXZpZXcnKVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUNvbXBvbmVudE1ldGFkYXRhKFxuICBzb3VyY2VGaWxlOiBTb3VyY2VGaWxlLFxuICBmaWxlUGF0aDogc3RyaW5nLFxuICBpbnRlcmZhY2VOYW1lOiBzdHJpbmcsXG4gIGltcG9ydElkZW50aWZpZXI/OiBzdHJpbmdcbik6IENvbXBvbmVudE1ldGFkYXRhIHtcbiAgY29uc3QgcHJvcHNJbnRlcmZhY2UgPSBzb3VyY2VGaWxlLmdldERlc2NlbmRhbnRzT2ZLaW5kKHRzLlN5bnRheEtpbmQuSW50ZXJmYWNlRGVjbGFyYXRpb24pLmZpbmQobiA9PiB7XG4gICAgcmV0dXJuIG4uZ2V0TmFtZSgpID09PSBpbnRlcmZhY2VOYW1lXG4gIH0pXG4gIGlmICghcHJvcHNJbnRlcmZhY2UpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIGludGVyZmFjZSBmb3VuZCB3aXRoIG5hbWUgXCIke2ludGVyZmFjZU5hbWV9XCIgaW4gZmlsZSBcIiR7ZmlsZVBhdGh9XCJgKVxuICB9XG4gIGNvbnN0IHByb3BlcnRpZXMgPSBwcm9wc0ludGVyZmFjZS5nZXRTdHJ1Y3R1cmUoKS5wcm9wZXJ0aWVzID8/IFtdXG4gIHJldHVybiB7XG4gICAgcHJvcFNoYXBlOiBwYXJzZVByb3BlcnR5U3RydWN0dXJlcyhwcm9wZXJ0aWVzLCBmaWxlUGF0aCksXG4gICAgaW5pdGlhbFByb3BzOiBwYXJzZUluaXRpYWxQcm9wcyhzb3VyY2VGaWxlKSxcbiAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICBpbXBvcnRJZGVudGlmaWVyOiBnZXRJbXBvcnRJZGVudGlmaWVyKClcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEltcG9ydElkZW50aWZpZXIoKSB7XG4gICAgaWYgKGltcG9ydElkZW50aWZpZXIpIHJldHVybiBpbXBvcnRJZGVudGlmaWVyXG4gICAgcmV0dXJuIHBhdGgucmVsYXRpdmUocGF0aFRvUGFnZVByZXZpZXcsIGZpbGVQYXRoKVxuICB9XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGhcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGgvY29tbW9uLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGgvY29tbW9uLnRzXCI7aW1wb3J0IHsgSlNEb2NhYmxlTm9kZVN0cnVjdHVyZSwgSnN4T3BlbmluZ0VsZW1lbnQsIEpzeFNlbGZDbG9zaW5nRWxlbWVudCwgUHJvcGVydHlOYW1lZE5vZGVTdHJ1Y3R1cmUsIFNvdXJjZUZpbGUsIHRzLCBUeXBlZE5vZGVTdHJ1Y3R1cmUsIE5vZGUsIFByb2plY3QsIEpzeEVsZW1lbnQsIEpzeEZyYWdtZW50LCBWYXJpYWJsZURlY2xhcmF0aW9uLCBGdW5jdGlvbkRlY2xhcmF0aW9uLCBKc3hBdHRyaWJ1dGUgfSBmcm9tICd0cy1tb3JwaCdcbmltcG9ydCB0eXBlc2NyaXB0LCB7IE1vZHVsZVJlc29sdXRpb25Ib3N0IH0gZnJvbSAndHlwZXNjcmlwdCdcbmltcG9ydCBwcmV0dGllciBmcm9tICdwcmV0dGllcidcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCB7IHNwZWNpYWxUeXBlc0FycmF5IH0gZnJvbSAnLi4vLi4vdHlwZXMnXG5pbXBvcnQgcGFyc2VJbXBvcnRzIGZyb20gJy4vcGFyc2VJbXBvcnRzJ1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBQcm9wU2hhcGUsIFByb3BUeXBlIH0gZnJvbSAnLi4vLi4vc2hhcmVkL21vZGVscydcblxuLy8gJ3R5cGVzY3JpcHQnIGlzIGEgQ29tbW9uSlMgbW9kdWxlLCB3aGljaCBtYXkgbm90IHN1cHBvcnQgYWxsIG1vZHVsZS5leHBvcnRzIGFzIG5hbWVkIGV4cG9ydHNcbmNvbnN0IHsgSnN4RW1pdCwgcmVzb2x2ZU1vZHVsZU5hbWUgfSA9IHR5cGVzY3JpcHRcblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXBvbmVudE5vZGVzKFxuICBwYXJlbnROb2RlOiBKc3hFbGVtZW50IHwgSnN4RnJhZ21lbnRcbik6IChKc3hPcGVuaW5nRWxlbWVudCB8IEpzeFNlbGZDbG9zaW5nRWxlbWVudClbXSB7XG4gIGNvbnN0IG5vZGVzID0gcGFyZW50Tm9kZVxuICAgIC5nZXREZXNjZW5kYW50cygpXG4gICAgLmZpbHRlcihuID0+IHtcbiAgICAgIHJldHVybiBuLmlzS2luZCh0cy5TeW50YXhLaW5kLkpzeE9wZW5pbmdFbGVtZW50KSB8fCBuLmlzS2luZCh0cy5TeW50YXhLaW5kLkpzeFNlbGZDbG9zaW5nRWxlbWVudClcbiAgICB9KSBhcyAoSnN4T3BlbmluZ0VsZW1lbnQgfCBKc3hTZWxmQ2xvc2luZ0VsZW1lbnQpW11cbiAgcmV0dXJuIG5vZGVzXG59XG5cbmV4cG9ydCBjb25zdCB0c0NvbXBpbGVyT3B0aW9ucyA9IHtcbiAgY29tcGlsZXJPcHRpb25zOiB7XG4gICAganN4OiBKc3hFbWl0LlJlYWN0SlNYXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXBvbmVudE5hbWUobjogSnN4T3BlbmluZ0VsZW1lbnQgfCBKc3hTZWxmQ2xvc2luZ0VsZW1lbnQpOiBzdHJpbmcge1xuICByZXR1cm4gbi5nZXRUYWdOYW1lTm9kZSgpLmdldFRleHQoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJldHRpZnkoY29kZTogc3RyaW5nKSB7XG4gIHJldHVybiBwcmV0dGllci5mb3JtYXQoY29kZSwge1xuICAgIHBhcnNlcjogJ3R5cGVzY3JpcHQnLFxuICAgIHNlbWk6IGZhbHNlLFxuICAgIHNpbmdsZVF1b3RlOiB0cnVlLFxuICAgIGpzeFNpbmdsZVF1b3RlOiB0cnVlXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm9wTmFtZShuOiBOb2RlKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIG4uZ2V0Rmlyc3REZXNjZW5kYW50QnlLaW5kKHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcik/LmNvbXBpbGVyTm9kZS50ZXh0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRKc3hBdHRyaWJ1dGVWYWx1ZShuOiBKc3hBdHRyaWJ1dGUpOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHtcbiAgY29uc3QgaW5pdGlhbGl6ZXIgPSBuLmdldEluaXRpYWxpemVyT3JUaHJvdygpXG4gIGlmIChpbml0aWFsaXplci5pc0tpbmQodHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsKSkge1xuICAgIHJldHVybiBpbml0aWFsaXplci5jb21waWxlck5vZGUudGV4dFxuICB9XG4gIGNvbnN0IGV4cHJlc3Npb24gPSBpbml0aWFsaXplci5nZXRFeHByZXNzaW9uT3JUaHJvdygpXG4gIGlmIChcbiAgICBleHByZXNzaW9uLmlzS2luZCh0cy5TeW50YXhLaW5kLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbikgfHxcbiAgICBleHByZXNzaW9uLmlzS2luZCh0cy5TeW50YXhLaW5kLlRlbXBsYXRlRXhwcmVzc2lvbilcbiAgKSB7XG4gICAgcmV0dXJuIGV4cHJlc3Npb24uZ2V0VGV4dCgpXG4gIH0gZWxzZSBpZiAoXG4gICAgZXhwcmVzc2lvbi5pc0tpbmQodHMuU3ludGF4S2luZC5OdW1lcmljTGl0ZXJhbCkgfHxcbiAgICBleHByZXNzaW9uLmlzS2luZCh0cy5TeW50YXhLaW5kLkZhbHNlS2V5d29yZCkgfHxcbiAgICBleHByZXNzaW9uLmlzS2luZCh0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkKVxuICApIHtcbiAgICByZXR1cm4gZXhwcmVzc2lvbi5nZXRMaXRlcmFsVmFsdWUoKVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5yZWNvZ25pemVkIEV4cHJlc3Npb24ga2luZDogJyArIGV4cHJlc3Npb24uZ2V0S2luZE5hbWUoKSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcFZhbHVlKG46IE5vZGUpOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHtcbiAgY29uc3Qgc3RyaW5nTm9kZSA9IG4uZ2V0Rmlyc3REZXNjZW5kYW50QnlLaW5kKHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbClcbiAgaWYgKHN0cmluZ05vZGUpIHtcbiAgICByZXR1cm4gc3RyaW5nTm9kZS5jb21waWxlck5vZGUudGV4dFxuICB9XG4gIGlmIChuLmdldEZpcnN0RGVzY2VuZGFudEJ5S2luZCh0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkKSkgcmV0dXJuIHRydWVcbiAgaWYgKG4uZ2V0Rmlyc3REZXNjZW5kYW50QnlLaW5kKHRzLlN5bnRheEtpbmQuRmFsc2VLZXl3b3JkKSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IG51bWJlck5vZGUgPSBuLmdldEZpcnN0RGVzY2VuZGFudEJ5S2luZCh0cy5TeW50YXhLaW5kLk51bWVyaWNMaXRlcmFsKVxuICBpZiAobnVtYmVyTm9kZSkge1xuICAgIHJldHVybiBwYXJzZUZsb2F0KG51bWJlck5vZGUuY29tcGlsZXJOb2RlLnRleHQpXG4gIH1cbiAgY29uc3QgdGVtcGxhdGVFeHByZXNzaW9uID0gbi5nZXRGaXJzdERlc2NlbmRhbnRCeUtpbmQodHMuU3ludGF4S2luZC5UZW1wbGF0ZUV4cHJlc3Npb24pXG4gIGlmICh0ZW1wbGF0ZUV4cHJlc3Npb24pIHtcbiAgICBjb25zdCB0ZW1wbGF0ZVN0cmluZ0luY2x1ZGluZ0JhY2t0aWtzID0gdGVtcGxhdGVFeHByZXNzaW9uLmdldEZ1bGxUZXh0KClcbiAgICAvLyByZW1vdmUgdGhlIGJhY2t0aWtzIHdoaWNoIHNob3VsZCBiZSB0aGUgZmlyc3QgYW5kIGxhc3QgY2hhcmFjdGVyc1xuICAgIHJldHVybiB0ZW1wbGF0ZVN0cmluZ0luY2x1ZGluZ0JhY2t0aWtzLnN1YnN0cmluZygxLCB0ZW1wbGF0ZVN0cmluZ0luY2x1ZGluZ0JhY2t0aWtzLmxlbmd0aCAtIDEpXG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCd1bmhhbmRsZWQgcHJvcCB2YWx1ZSBmb3Igbm9kZTogJyArIG4uZ2V0RnVsbFRleHQoKSArICcgd2l0aCBraW5kOiAnICsgbi5nZXRLaW5kTmFtZSgpKVxufVxuXG5pbnRlcmZhY2UgUGFyc2VhYmxlUHJvcGVydHlTdHJ1Y3R1cmUgZXh0ZW5kc1xuICBKU0RvY2FibGVOb2RlU3RydWN0dXJlLCBUeXBlZE5vZGVTdHJ1Y3R1cmUsIFByb3BlcnR5TmFtZWROb2RlU3RydWN0dXJlIHt9XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVByb3BlcnR5U3RydWN0dXJlcyhwcm9wZXJ0aWVzOiBQYXJzZWFibGVQcm9wZXJ0eVN0cnVjdHVyZVtdLCBmaWxlUGF0aDogc3RyaW5nKSB7XG4gIGNvbnN0IHByb3BzOiBQcm9wU2hhcGUgPSB7fVxuXG4gIGxldCBpbXBvcnRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT5cbiAgcHJvcGVydGllcy5mb3JFYWNoKHAgPT4ge1xuICAgIGNvbnN0IGpzZG9jID0gcC5kb2NzPy5tYXAoZG9jID0+IHR5cGVvZiBkb2MgPT09ICdzdHJpbmcnID8gZG9jIDogZG9jLmRlc2NyaXB0aW9uKS5qb2luKCdcXG4nKVxuXG4gICAgaWYgKGlzUHJvcFR5cGUocC50eXBlKSkge1xuICAgICAgaWYgKFsnc3RyaW5nJywgJ251bWJlcicsICdib29sZWFuJ10uaW5jbHVkZXMocC50eXBlKSB8fCB2YWxpZGF0ZVByb3AocC50eXBlKSkge1xuICAgICAgICBwcm9wc1twLm5hbWVdID0ge1xuICAgICAgICAgIHR5cGU6IHAudHlwZSxcbiAgICAgICAgICAuLi4oanNkb2MgJiYgeyBkb2M6IGpzZG9jIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcihgUHJvcCB0eXBlICR7cC50eXBlfSBpcyBub3QgcmVjb2duaXplZC4gU2tpcHBpbmcgZ3JhY2VmdWxseS5gKVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIHByb3BzXG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVQcm9wKHR5cGU6IFByb3BUeXBlKTogYm9vbGVhbiB7XG4gICAgaWYgKCFpbXBvcnRzKSB7XG4gICAgICBpbXBvcnRzID0gcGFyc2VJbXBvcnRzKGZpbGVQYXRoKVxuICAgIH1cblxuICAgIGlmIChbJ3N0cmluZycsICdib29sZWFuJywgJ251bWJlciddLmluY2x1ZGVzKHR5cGUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBjb25zdCBpc1ZhbGlkUHJvcCA9ICEhT2JqZWN0LmVudHJpZXMoaW1wb3J0cykuZmluZCgoW3BhdGgsIG5hbWVzXSkgPT4ge1xuICAgICAgaWYgKG5hbWVzLnNvbWUobmFtZSA9PiBuYW1lID09PSB0eXBlKSkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShmaWxlUGF0aCwgJy4uJywgcGF0aCkgPT09IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vdHlwZXMnKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSlcbiAgICBpZiAoIWlzVmFsaWRQcm9wKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBTa2lwcGluZyBwcm9wIHR5cGUgJHt0eXBlfSBiZWNhdXNlIGl0IHdhcyBub3QgaW1wb3J0ZWQgZnJvbSB0aGUgU3R1ZGlvJ3MgdHlwZXMudHMuYClcbiAgICB9XG4gICAgcmV0dXJuIGlzVmFsaWRQcm9wXG4gIH1cblxuICBmdW5jdGlvbiBpc1Byb3BUeXBlKHR5cGU6IHVua25vd24pOiB0eXBlIGlzIFByb3BUeXBlIHtcbiAgICBjb25zdCB0eXBlcyA9IFsnc3RyaW5nJywgJ251bWJlcicsICdib29sZWFuJ10uY29uY2F0KHNwZWNpYWxUeXBlc0FycmF5KVxuICAgIHJldHVybiB0eXBlcy5zb21lKHQgPT4gdCA9PT0gdHlwZSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZU5wbU1vZHVsZShtb2R1bGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBjdXN0b21Nb2R1bGVSZXNvbHV0aW9uSG9zdDogTW9kdWxlUmVzb2x1dGlvbkhvc3QgPSB7XG4gICAgZmlsZUV4aXN0cyhmaWxlTmFtZSkge1xuICAgICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMocmVzb2x2ZVRzRmlsZU5hbWUoZmlsZU5hbWUpKVxuICAgIH0sXG4gICAgcmVhZEZpbGUoZmlsZU5hbWUpIHtcbiAgICAgIHJldHVybiBmcy5yZWFkRmlsZVN5bmMocmVzb2x2ZVRzRmlsZU5hbWUoZmlsZU5hbWUpLCAndXRmLTgnKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHsgcmVzb2x2ZWRNb2R1bGUgfSA9IHJlc29sdmVNb2R1bGVOYW1lKG1vZHVsZU5hbWUsICcnLCB7fSwgY3VzdG9tTW9kdWxlUmVzb2x1dGlvbkhvc3QpXG4gIGlmICghcmVzb2x2ZWRNb2R1bGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCByZXNvbHZlIG1vZHVsZTogXCIke21vZHVsZU5hbWV9XCJgKVxuICB9XG4gIGNvbnN0IGFic1BhdGggPSByZXNvbHZlVHNGaWxlTmFtZShyZXNvbHZlZE1vZHVsZS5yZXNvbHZlZEZpbGVOYW1lKVxuICByZXR1cm4gYWJzUGF0aFxuXG4gIGZ1bmN0aW9uIHJlc29sdmVUc0ZpbGVOYW1lKGZpbGVOYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8uLicsIGZpbGVOYW1lKVxuICB9XG59XG5cbi8qKiBUaGlzIGlzIGZvciBkZXZlbG9wbWVudC90ZXN0aW5nIHB1cnBvc2VzIG9ubHkgKi9cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZU5vZGVUb0ZpbGUoY29tcGlsZXJOb2RlOiBhbnksIHRlc3RGaWxlTmFtZSA9ICd0ZXN0Lmpzb24nKSB7XG4gIGZzLndyaXRlRmlsZVN5bmModGVzdEZpbGVOYW1lLCBKU09OLnN0cmluZ2lmeShjb21waWxlck5vZGUsIChrZXksIHZhbCkgPT4ge1xuICAgIGlmIChbJ3BhcmVudCcsICdwb3MnLCAnZW5kJywgJ2ZsYWdzJywgJ21vZGlmaWVyRmxhZ3NDYWNoZScsICd0cmFuc2Zvcm1GbGFncyddLmluY2x1ZGVzKGtleSkgfHwga2V5LnN0YXJ0c1dpdGgoJ18nKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICBpZiAoa2V5ID09PSAna2luZCcpIHtcbiAgICAgIHJldHVybiB0cy5TeW50YXhLaW5kW3ZhbF1cbiAgICB9XG4gICAgcmV0dXJuIHZhbFxuICB9LCAyKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNvdXJjZUZpbGUoZmlsZTogc3RyaW5nKTogU291cmNlRmlsZSB7XG4gIGNvbnN0IHAgPSBuZXcgUHJvamVjdCh0c0NvbXBpbGVyT3B0aW9ucylcbiAgcC5hZGRTb3VyY2VGaWxlc0F0UGF0aHMoZmlsZSlcbiAgcmV0dXJuIHAuZ2V0U291cmNlRmlsZU9yVGhyb3coZmlsZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRFeHBvcnQoc291cmNlRmlsZTogU291cmNlRmlsZSk6IFZhcmlhYmxlRGVjbGFyYXRpb24gfCBGdW5jdGlvbkRlY2xhcmF0aW9uIHtcbiAgY29uc3QgZGVjbGFyYXRpb25zID0gc291cmNlRmlsZS5nZXREZWZhdWx0RXhwb3J0U3ltYm9sT3JUaHJvdygpLmdldERlY2xhcmF0aW9ucygpXG4gIGlmIChkZWNsYXJhdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciBnZXR0aW5nIGRlZmF1bHQgZXhwb3J0JylcbiAgfVxuICBjb25zdCBub2RlID0gZGVjbGFyYXRpb25zWzBdXG4gIGlmIChub2RlLmlzS2luZCh0cy5TeW50YXhLaW5kLkV4cG9ydEFzc2lnbm1lbnQpKSB7XG4gICAgY29uc3QgaWRlbnRpZmllck5hbWUgPSBub2RlLmdldEZpcnN0RGVzY2VuZGFudEJ5S2luZE9yVGhyb3codHMuU3ludGF4S2luZC5JZGVudGlmaWVyKS5nZXRUZXh0KClcbiAgICByZXR1cm4gc291cmNlRmlsZS5nZXRWYXJpYWJsZURlY2xhcmF0aW9uT3JUaHJvdyhpZGVudGlmaWVyTmFtZSlcbiAgfSBlbHNlIGlmIChub2RlLmlzS2luZCh0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb24pKSB7XG4gICAgcmV0dXJuIG5vZGVcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIGdldHRpbmcgZGVmYXVsdCBleHBvcnQsIG5vIEV4cG9ydEFzc2lnbm1lbnQgb3IgRnVuY3Rpb25EZWNsYXJhdGlvbiBmb3VuZCcpXG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvb3NoaS9zdHVkaW8tcHJvdG90eXBlL3N0dWRpb1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL29zaGkvc3R1ZGlvLXByb3RvdHlwZS9zdHVkaW8vdHlwZXMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL29zaGkvc3R1ZGlvLXByb3RvdHlwZS9zdHVkaW8vdHlwZXMudHNcIjtleHBvcnQgdHlwZSBIZXhDb2xvciA9IGAjJHtzdHJpbmd9YFxuZXhwb3J0IHR5cGUgU3RyZWFtc1RlbXBsYXRlU3RyaW5nID0gc3RyaW5nXG5leHBvcnQgdHlwZSBTdHJlYW1zRGF0YVBhdGggPSBzdHJpbmdcblxuZXhwb3J0IHR5cGUgU3BlY2lhbFR5cGVzID1cbiAgSGV4Q29sb3IgfFxuICBTdHJlYW1zVGVtcGxhdGVTdHJpbmcgfFxuICBTdHJlYW1zRGF0YVBhdGhcblxuZXhwb3J0IGNvbnN0IHNwZWNpYWxUeXBlc0FycmF5ID0gWydIZXhDb2xvcicsICdTdHJlYW1zVGVtcGxhdGVTdHJpbmcnLCAnU3RyZWFtc0RhdGFQYXRoJ11cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvb3NoaS9zdHVkaW8tcHJvdG90eXBlL3N0dWRpby9zdHVkaW8tcGx1Z2luL3RzLW1vcnBoXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvb3NoaS9zdHVkaW8tcHJvdG90eXBlL3N0dWRpby9zdHVkaW8tcGx1Z2luL3RzLW1vcnBoL3BhcnNlSW1wb3J0cy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvb3NoaS9zdHVkaW8tcHJvdG90eXBlL3N0dWRpby9zdHVkaW8tcGx1Z2luL3RzLW1vcnBoL3BhcnNlSW1wb3J0cy50c1wiO2ltcG9ydCB7IFNvdXJjZUZpbGUsIFN5bnRheEtpbmQgfSBmcm9tICd0cy1tb3JwaCdcbmltcG9ydCB7IGdldFNvdXJjZUZpbGUgfSBmcm9tICcuL2NvbW1vbidcblxuLyoqXG4gKiBSZXR1cm5zIGEgbWFwcGluZyBvZiBpbXBvcnQgaWRlbnRpZmllciAoaS5lLiBwYXRoIG9yIG1vZHVsZSBuYW1lKVxuICogdG8gaWRlbnRpZmllcnMgaW1wb3J0ZWQgZnJvbSB0aGF0IHBhdGggb3IgbW9kdWxlIG5hbWUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlSW1wb3J0cyhmaWxlOiBzdHJpbmcgfCBTb3VyY2VGaWxlKTogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+IHtcbiAgY29uc3Qgc291cmNlRmlsZSA9IHR5cGVvZiBmaWxlID09PSAnc3RyaW5nJyA/IGdldFNvdXJjZUZpbGUoZmlsZSkgOiBmaWxlXG4gIGNvbnN0IGltcG9ydFBhdGhUb0ltcG9ydE5hbWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7fVxuXG4gIHNvdXJjZUZpbGUuZ2V0RGVzY2VuZGFudHNPZktpbmQoU3ludGF4S2luZC5JbXBvcnREZWNsYXJhdGlvbikuZm9yRWFjaChpbXBvcnREZWNsYXJhdGlvbiA9PiB7XG4gICAgY29uc3QgaW1wb3J0Q2xhdXNlID0gaW1wb3J0RGVjbGFyYXRpb24uZ2V0Rmlyc3REZXNjZW5kYW50QnlLaW5kKFN5bnRheEtpbmQuSW1wb3J0Q2xhdXNlKVxuICAgIC8vICBJZ25vcmUgaW1wb3J0cyBsaWtlIGBpbXBvcnQgJ2luZGV4LmNzcydgIHdoaWNoIGxhY2sgYW4gaW1wb3J0IGNsYXVzZVxuICAgIGlmICghaW1wb3J0Q2xhdXNlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgZGVmYXVsdEltcG9ydDogc3RyaW5nIHwgdW5kZWZpbmVkID0gaW1wb3J0Q2xhdXNlLmdldERlZmF1bHRJbXBvcnQoKT8uZ2V0VGV4dCgpXG4gICAgY29uc3QgbmFtZWRJbXBvcnRzOiBzdHJpbmdbXSA9IGltcG9ydENsYXVzZS5nZXROYW1lZEltcG9ydHMoKVxuICAgICAgLm1hcChuID0+IG4uY29tcGlsZXJOb2RlLm5hbWUuZXNjYXBlZFRleHQudG9TdHJpbmcoKSlcbiAgICBjb25zdCBpbXBvcnRQYXRoOiBzdHJpbmcgPSBpbXBvcnREZWNsYXJhdGlvbi5nZXRNb2R1bGVTcGVjaWZpZXJWYWx1ZSgpXG4gICAgaWYgKCFpbXBvcnRQYXRoVG9JbXBvcnROYW1lc1tpbXBvcnRQYXRoXSkge1xuICAgICAgaW1wb3J0UGF0aFRvSW1wb3J0TmFtZXNbaW1wb3J0UGF0aF0gPSBbXVxuICAgIH1cbiAgICBpbXBvcnRQYXRoVG9JbXBvcnROYW1lc1tpbXBvcnRQYXRoXS5wdXNoKC4uLm5hbWVkSW1wb3J0cylcbiAgICBkZWZhdWx0SW1wb3J0ICYmIGltcG9ydFBhdGhUb0ltcG9ydE5hbWVzW2ltcG9ydFBhdGhdLnB1c2goZGVmYXVsdEltcG9ydClcbiAgfSlcbiAgcmV0dXJuIGltcG9ydFBhdGhUb0ltcG9ydE5hbWVzXG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGhcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGgvcGFyc2VJbml0aWFsUHJvcHMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL29zaGkvc3R1ZGlvLXByb3RvdHlwZS9zdHVkaW8vc3R1ZGlvLXBsdWdpbi90cy1tb3JwaC9wYXJzZUluaXRpYWxQcm9wcy50c1wiO2ltcG9ydCB7IFNvdXJjZUZpbGUsIHRzIH0gZnJvbSAndHMtbW9ycGgnXG5pbXBvcnQgeyBQcm9wU3RhdGUgfSBmcm9tICcuLi8uLi9zaGFyZWQvbW9kZWxzJ1xuaW1wb3J0IHsgZ2V0UHJvcE5hbWUsIGdldFByb3BWYWx1ZSB9IGZyb20gJy4vY29tbW9uJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUluaXRpYWxQcm9wcyhzb3VyY2VGaWxlOiBTb3VyY2VGaWxlKTogUHJvcFN0YXRlIHtcbiAgY29uc3QgcHJvcHM6IFByb3BTdGF0ZSA9IHt9XG4gIGNvbnN0IGluaXRpYWxQcm9wc1N5bWJvbCA9IHNvdXJjZUZpbGUuZ2V0RXhwb3J0U3ltYm9scygpLmZpbmQocyA9PiBzLmNvbXBpbGVyU3ltYm9sLmVzY2FwZWROYW1lID09PSAnaW5pdGlhbFByb3BzJylcbiAgaWYgKCFpbml0aWFsUHJvcHNTeW1ib2wpIHtcbiAgICByZXR1cm4gcHJvcHNcbiAgfVxuXG4gIGNvbnN0IGluaXRpYWxQcm9wcyA9XG4gICAgaW5pdGlhbFByb3BzU3ltYm9sPy5nZXRWYWx1ZURlY2xhcmF0aW9uKCk/LmdldEZpcnN0RGVzY2VuZGFudEJ5S2luZCh0cy5TeW50YXhLaW5kLk9iamVjdExpdGVyYWxFeHByZXNzaW9uKVxuICBpZiAoIWluaXRpYWxQcm9wcykge1xuICAgIHJldHVybiBwcm9wc1xuICB9XG5cbiAgaW5pdGlhbFByb3BzLmdldERlc2NlbmRhbnRzKCkuZm9yRWFjaChkID0+IHtcbiAgICBjb25zdCBwcm9wTmFtZSA9IGdldFByb3BOYW1lKGQpXG4gICAgaWYgKCFwcm9wTmFtZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHByb3BzW3Byb3BOYW1lXSA9IGdldFByb3BWYWx1ZShkKVxuICB9KVxuXG4gIHJldHVybiBwcm9wc1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvb3NoaS9zdHVkaW8tcHJvdG90eXBlL3N0dWRpby9zdHVkaW8tcGx1Z2luL3RzLW1vcnBoXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvb3NoaS9zdHVkaW8tcHJvdG90eXBlL3N0dWRpby9zdHVkaW8tcGx1Z2luL3RzLW1vcnBoL3BhcnNlU2l0ZVNldHRpbmdzRmlsZS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvb3NoaS9zdHVkaW8tcHJvdG90eXBlL3N0dWRpby9zdHVkaW8tcGx1Z2luL3RzLW1vcnBoL3BhcnNlU2l0ZVNldHRpbmdzRmlsZS50c1wiO2ltcG9ydCB7IFByb3BlcnR5QXNzaWdubWVudCwgdHMgfSBmcm9tICd0cy1tb3JwaCdcbmltcG9ydCB7IFByb3BTdGF0ZSB9IGZyb20gJy4uLy4uL3NoYXJlZC9tb2RlbHMnXG5pbXBvcnQgZ2V0Um9vdFBhdGggZnJvbSAnLi4vZ2V0Um9vdFBhdGgnXG5pbXBvcnQgeyBnZXRQcm9wVmFsdWUsIGdldFNvdXJjZUZpbGUgfSBmcm9tICcuL2NvbW1vbidcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VTaXRlU2V0dGluZ3NGaWxlKGZpbGVQYXRoOiBzdHJpbmcsIGludGVyZmFjZU5hbWU6IHN0cmluZyk6IFByb3BTdGF0ZSB7XG4gIGNvbnN0IGZpbGUgPSBnZXRSb290UGF0aChmaWxlUGF0aClcbiAgY29uc3Qgc291cmNlRmlsZSA9IGdldFNvdXJjZUZpbGUoZmlsZSlcbiAgY29uc3Qgc2l0ZVNldHRpbmdzTm9kZSA9IHNvdXJjZUZpbGVcbiAgICAuZ2V0RGVzY2VuZGFudHNPZktpbmQodHMuU3ludGF4S2luZC5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbilcbiAgICAuZmluZChuID0+IG4uZ2V0Q29udGV4dHVhbFR5cGUoKT8uZ2V0U3ltYm9sKCk/LmdldE5hbWUoKSA9PT0gaW50ZXJmYWNlTmFtZSlcblxuICBpZiAoIXNpdGVTZXR0aW5nc05vZGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYHVuYWJsZSB0byBmaW5kIHNpdGUgc2V0dGluZ3Mgb2JqZWN0IG9mIHR5cGUgJHtpbnRlcmZhY2VOYW1lfSBpbiBmaWxlcGF0aCAke2ZpbGVQYXRofWApXG4gIH1cblxuICBjb25zdCBwcm9wU3RhdGUgPSB7fVxuICAvLyBvbmx5IHN1cHBvcnQgdHlwZSBQcm9wZXJ0eUFzc2lnbm1lbnRcbiAgc2l0ZVNldHRpbmdzTm9kZVxuICAgIC5nZXRQcm9wZXJ0aWVzKClcbiAgICAuZmlsdGVyKChwKTogcCBpcyBQcm9wZXJ0eUFzc2lnbm1lbnQgPT4gcC5pc0tpbmQodHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFzc2lnbm1lbnQpKVxuICAgIC5mb3JFYWNoKHAgPT4gcHJvcFN0YXRlW3AuZ2V0TmFtZSgpXSA9IGdldFByb3BWYWx1ZShwKSlcbiAgcmV0dXJuIHByb3BTdGF0ZVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvb3NoaS9zdHVkaW8tcHJvdG90eXBlL3N0dWRpby9zdHVkaW8tcGx1Z2luXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvb3NoaS9zdHVkaW8tcHJvdG90eXBlL3N0dWRpby9zdHVkaW8tcGx1Z2luL2dldFJvb3RQYXRoLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vZ2V0Um9vdFBhdGgudHNcIjtpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5jb25zdCByb290UGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLicpXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFJvb3RQYXRoKHNyY1BhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBwYXRoLmpvaW4ocm9vdFBhdGgsIHNyY1BhdGgpXG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvb3NoaS9zdHVkaW8tcHJvdG90eXBlL3N0dWRpby9zdHVkaW8tcGx1Z2luL3RzLW1vcnBoXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvb3NoaS9zdHVkaW8tcHJvdG90eXBlL3N0dWRpby9zdHVkaW8tcGx1Z2luL3RzLW1vcnBoL3BhcnNlUGFnZUZpbGUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL29zaGkvc3R1ZGlvLXByb3RvdHlwZS9zdHVkaW8vc3R1ZGlvLXBsdWdpbi90cy1tb3JwaC9wYXJzZVBhZ2VGaWxlLnRzXCI7aW1wb3J0IHsgSnN4QXR0cmlidXRlLCB0cywgU291cmNlRmlsZSwgSnN4RWxlbWVudCwgSnN4RnJhZ21lbnQgfSBmcm9tICd0cy1tb3JwaCdcbmltcG9ydCB7IENvbXBvbmVudFN0YXRlLCBQb3NzaWJsZU1vZHVsZU5hbWVzLCBQYWdlU3RhdGUgfSBmcm9tICcuLi8uLi9zaGFyZWQvbW9kZWxzJ1xuaW1wb3J0IHsgZ2V0Q29tcG9uZW50TmFtZSwgZ2V0Q29tcG9uZW50Tm9kZXMsIGdldERlZmF1bHRFeHBvcnQsIGdldEpzeEF0dHJpYnV0ZVZhbHVlLCBnZXRQcm9wTmFtZSwgZ2V0U291cmNlRmlsZSB9IGZyb20gJy4vY29tbW9uJ1xuaW1wb3J0IHsgdjEgfSBmcm9tICd1dWlkJ1xuaW1wb3J0IHBhcnNlSW1wb3J0cyBmcm9tICcuL3BhcnNlSW1wb3J0cydcblxuZnVuY3Rpb24gcGFyc2VMYXlvdXRTdGF0ZShcbiAgc291cmNlRmlsZTogU291cmNlRmlsZSxcbiAgaW1wb3J0czogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+XG4pOiB7IGxheW91dFN0YXRlOiBDb21wb25lbnRTdGF0ZSwgbGF5b3V0Tm9kZTogSnN4RWxlbWVudCB8IEpzeEZyYWdtZW50IH0ge1xuICBjb25zdCBkZWZhdWx0RXhwb3J0ID0gZ2V0RGVmYXVsdEV4cG9ydChzb3VyY2VGaWxlKVxuICBjb25zdCByZXR1cm5TdGF0ZW1lbnQgPSBkZWZhdWx0RXhwb3J0LmdldEZpcnN0RGVzY2VuZGFudEJ5S2luZCh0cy5TeW50YXhLaW5kLlJldHVyblN0YXRlbWVudClcbiAgaWYgKCFyZXR1cm5TdGF0ZW1lbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHJldHVybiBzdGF0ZW1lbnQgZm91bmQgZm9yIHBhZ2UnKVxuICB9XG4gIGNvbnN0IEpzeE5vZGVXcmFwcGVyID0gcmV0dXJuU3RhdGVtZW50LmdldEZpcnN0Q2hpbGRCeUtpbmQodHMuU3ludGF4S2luZC5QYXJlbnRoZXNpemVkRXhwcmVzc2lvbilcbiAgICA/PyByZXR1cm5TdGF0ZW1lbnRcbiAgY29uc3QgdG9wTGV2ZWxKc3hOb2RlID0gSnN4Tm9kZVdyYXBwZXIuZ2V0Q2hpbGRyZW4oKVxuICAgIC5maW5kKG4gPT4gbi5nZXRLaW5kKCkgPT09IHRzLlN5bnRheEtpbmQuSnN4RWxlbWVudCB8fCBuLmdldEtpbmQoKSA9PT0gdHMuU3ludGF4S2luZC5Kc3hGcmFnbWVudClcbiAgaWYgKCF0b3BMZXZlbEpzeE5vZGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBmaW5kIHRvcCBsZXZlbCBKU1ggZWxlbWVudCBvciBKc3hGcmFnbWVudCB0eXBlIGZyb20gZmlsZS4nKVxuICB9XG5cbiAgbGV0IGxheW91dFN0YXRlOiBDb21wb25lbnRTdGF0ZVxuICBpZiAodG9wTGV2ZWxKc3hOb2RlLmdldEtpbmQoKSA9PT0gdHMuU3ludGF4S2luZC5Kc3hFbGVtZW50KSB7XG4gICAgY29uc3QgbmFtZSA9IGdldENvbXBvbmVudE5hbWUoKHRvcExldmVsSnN4Tm9kZSBhcyBKc3hFbGVtZW50KS5nZXRPcGVuaW5nRWxlbWVudCgpKVxuICAgIGxheW91dFN0YXRlID0ge1xuICAgICAgbmFtZSxcbiAgICAgIHByb3BzOiB7fSxcbiAgICAgIHV1aWQ6IHYxKCksXG4gICAgfVxuICAgIGNvbnN0IGlzQnVpbHRpbkpzeEVsZW1lbnQgPSBuYW1lLmNoYXJBdCgwKSA9PT0gbmFtZS5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKVxuICAgIGlmICghaXNCdWlsdGluSnN4RWxlbWVudCAmJiAhWydGcmFnbWVudCcsICdSZWFjdC5GcmFnbWVudCddLmluY2x1ZGVzKG5hbWUpKSB7XG4gICAgICBsYXlvdXRTdGF0ZS5tb2R1bGVOYW1lID0gZ2V0Q29tcG9uZW50TW9kdWxlTmFtZShuYW1lLCBpbXBvcnRzKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsYXlvdXRTdGF0ZSA9IHtcbiAgICAgIG5hbWU6ICcnLFxuICAgICAgcHJvcHM6IHt9LFxuICAgICAgdXVpZDogdjEoKSxcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGxheW91dFN0YXRlLFxuICAgIGxheW91dE5vZGU6IHRvcExldmVsSnN4Tm9kZSBhcyBKc3hFbGVtZW50IHwgSnN4RnJhZ21lbnRcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZVBhZ2VGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBQYWdlU3RhdGUge1xuICBjb25zdCBzb3VyY2VGaWxlID0gZ2V0U291cmNlRmlsZShmaWxlUGF0aClcbiAgY29uc3QgaW1wb3J0cyA9IHBhcnNlSW1wb3J0cyhzb3VyY2VGaWxlKVxuXG4gIGNvbnN0IHsgbGF5b3V0U3RhdGUsIGxheW91dE5vZGUgfSA9IHBhcnNlTGF5b3V0U3RhdGUoc291cmNlRmlsZSwgaW1wb3J0cylcbiAgY29uc3QgdXNlZENvbXBvbmVudHMgPSBnZXRDb21wb25lbnROb2RlcyhsYXlvdXROb2RlKVxuXG4gIGNvbnN0IGxheW91dEpzeE9wZW5pbmdFbGVtZW50ID0gbGF5b3V0Tm9kZS5nZXRLaW5kKCkgPT09IHRzLlN5bnRheEtpbmQuSnN4RWxlbWVudFxuICAgID8gKGxheW91dE5vZGUgYXMgSnN4RWxlbWVudCkuZ2V0T3BlbmluZ0VsZW1lbnQoKVxuICAgIDogKGxheW91dE5vZGUgYXMgSnN4RnJhZ21lbnQpLmdldE9wZW5pbmdGcmFnbWVudCgpXG5cbiAgY29uc3QgY29tcG9uZW50c1N0YXRlOiBDb21wb25lbnRTdGF0ZVtdID0gW11cbiAgdXNlZENvbXBvbmVudHMuZm9yRWFjaChuID0+IHtcbiAgICBpZiAobiA9PT0gbGF5b3V0SnN4T3BlbmluZ0VsZW1lbnQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBuYW1lID0gZ2V0Q29tcG9uZW50TmFtZShuKVxuICAgIGNvbnN0IGNvbXBvbmVudERhdGE6IENvbXBvbmVudFN0YXRlID0ge1xuICAgICAgbmFtZSxcbiAgICAgIHByb3BzOiB7fSxcbiAgICAgIHV1aWQ6IHYxKCksXG4gICAgICBtb2R1bGVOYW1lOiBnZXRDb21wb25lbnRNb2R1bGVOYW1lKG5hbWUsIGltcG9ydHMpXG4gICAgfVxuICAgIG4uZ2V0RGVzY2VuZGFudHNPZktpbmQodHMuU3ludGF4S2luZC5Kc3hBdHRyaWJ1dGUpLmZvckVhY2goKGpzeEF0dHJpYnV0ZTogSnN4QXR0cmlidXRlKSA9PiB7XG4gICAgICBjb25zdCBwcm9wTmFtZSA9IGdldFByb3BOYW1lKGpzeEF0dHJpYnV0ZSlcbiAgICAgIGlmICghcHJvcE5hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgcGFyc2UganN4IGF0dHJpYnV0ZSBwcm9wIG5hbWU6ICcgKyBqc3hBdHRyaWJ1dGUuZ2V0RnVsbFRleHQoKSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IHByb3BWYWx1ZSA9IGdldEpzeEF0dHJpYnV0ZVZhbHVlKGpzeEF0dHJpYnV0ZSlcbiAgICAgIGNvbXBvbmVudERhdGEucHJvcHNbcHJvcE5hbWVdID0gcHJvcFZhbHVlXG4gICAgfSlcbiAgICBjb21wb25lbnRzU3RhdGUucHVzaChjb21wb25lbnREYXRhKVxuICB9KVxuXG4gIHJldHVybiB7XG4gICAgbGF5b3V0U3RhdGUsXG4gICAgY29tcG9uZW50c1N0YXRlXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0Q29tcG9uZW50TW9kdWxlTmFtZShuYW1lOiBzdHJpbmcsIGltcG9ydHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPik6IFBvc3NpYmxlTW9kdWxlTmFtZXMge1xuICBsZXQgbW9kdWxlTmFtZSA9IE9iamVjdC5rZXlzKGltcG9ydHMpLmZpbmQoaW1wb3J0SWRlbnRpZmllciA9PiB7XG4gICAgY29uc3QgaW1wb3J0ZWROYW1lcyA9IGltcG9ydHNbaW1wb3J0SWRlbnRpZmllcl1cbiAgICByZXR1cm4gaW1wb3J0ZWROYW1lcy5pbmNsdWRlcyhuYW1lKVxuICB9KVxuICBpZiAoIW1vZHVsZU5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGltcG9ydCBwYXRoL21vZHVsZSBmb3IgY29tcG9uZW50IFwiJHtuYW1lfVwiYClcbiAgfVxuICBpZiAobW9kdWxlTmFtZS5zdGFydHNXaXRoKCcuJykpIHtcbiAgICBtb2R1bGVOYW1lID0gJ2xvY2FsQ29tcG9uZW50cydcbiAgfVxuICByZXR1cm4gbW9kdWxlTmFtZSBhcyBQb3NzaWJsZU1vZHVsZU5hbWVzXG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGhcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGgvdXBkYXRlUGFnZUZpbGUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL29zaGkvc3R1ZGlvLXByb3RvdHlwZS9zdHVkaW8vc3R1ZGlvLXBsdWdpbi90cy1tb3JwaC91cGRhdGVQYWdlRmlsZS50c1wiO2ltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCB7IEFycm93RnVuY3Rpb24sIEZ1bmN0aW9uRGVjbGFyYXRpb24sIE5vZGUsIHRzLCBWYXJpYWJsZURlY2xhcmF0aW9uIH0gZnJvbSAndHMtbW9ycGgnXG5pbXBvcnQgeyBQYWdlU3RhdGUsIFByb3BTdGF0ZSwgUHJvcFNoYXBlIH0gZnJvbSAnLi4vLi4vc2hhcmVkL21vZGVscydcbmltcG9ydCB7IGdldERlZmF1bHRFeHBvcnQsIGdldFNvdXJjZUZpbGUsIHByZXR0aWZ5IH0gZnJvbSAnLi9jb21tb24nXG5pbXBvcnQgeyBtb2R1bGVOYW1lVG9Db21wb25lbnRNZXRhZGF0YSB9IGZyb20gJy4uL2NvbXBvbmVudE1ldGFkYXRhJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB1cGRhdGVQYWdlRmlsZSh1cGRhdGVkU3RhdGU6IFBhZ2VTdGF0ZSwgcGFnZUZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgY29uc3Qgc291cmNlRmlsZSA9IGdldFNvdXJjZUZpbGUocGFnZUZpbGVQYXRoKVxuICBjb25zdCBkZWZhdWx0RXhwb3J0ID0gZ2V0RGVmYXVsdEV4cG9ydChzb3VyY2VGaWxlKVxuICBjb25zdCBwYWdlQ29tcG9uZW50ID0gZ2V0UGFnZUNvbXBvbmVudEZ1bmN0aW9uKGRlZmF1bHRFeHBvcnQpXG4gIGNvbnN0IHJldHVyblN0YXRlbWVudEluZGV4ID0gcGFnZUNvbXBvbmVudC5nZXREZXNjZW5kYW50U3RhdGVtZW50cygpLmZpbmRJbmRleChuID0+IHtcbiAgICByZXR1cm4gbi5pc0tpbmQodHMuU3ludGF4S2luZC5SZXR1cm5TdGF0ZW1lbnQpXG4gIH0pXG5cbiAgaWYgKHJldHVyblN0YXRlbWVudEluZGV4IDwgMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgTm8gcmV0dXJuIHN0YXRlbWVudCBmb3VuZCBhdCBwYWdlOiBcIiR7cGFnZUZpbGVQYXRofVwiYClcbiAgfVxuICBwYWdlQ29tcG9uZW50LnJlbW92ZVN0YXRlbWVudChyZXR1cm5TdGF0ZW1lbnRJbmRleClcbiAgcGFnZUNvbXBvbmVudC5hZGRTdGF0ZW1lbnRzKGNyZWF0ZVJldHVyblN0YXRlbWVudCh1cGRhdGVkU3RhdGUpKVxuXG4gIGNvbnN0IHVwZGF0ZWRGaWxlVGV4dCA9IHByZXR0aWZ5KHNvdXJjZUZpbGUuZ2V0RnVsbFRleHQoKSlcbiAgZnMud3JpdGVGaWxlU3luYyhwYWdlRmlsZVBhdGgsIHVwZGF0ZWRGaWxlVGV4dClcbn1cblxuZnVuY3Rpb24gZ2V0UGFnZUNvbXBvbmVudEZ1bmN0aW9uKFxuICBkZWZhdWx0RXhwb3J0OiBWYXJpYWJsZURlY2xhcmF0aW9uIHwgRnVuY3Rpb25EZWNsYXJhdGlvblxuKTogRnVuY3Rpb25EZWNsYXJhdGlvbiB8IEFycm93RnVuY3Rpb24ge1xuICBpZiAoZGVmYXVsdEV4cG9ydC5pc0tpbmQodHMuU3ludGF4S2luZC5WYXJpYWJsZURlY2xhcmF0aW9uKSkge1xuICAgIGNvbnN0IGFycm93RnVuY3Rpb24gPSBkZWZhdWx0RXhwb3J0LmdldEZpcnN0RGVzY2VuZGFudEJ5S2luZE9yVGhyb3codHMuU3ludGF4S2luZC5BcnJvd0Z1bmN0aW9uKVxuICAgIHJldHVybiBhcnJvd0Z1bmN0aW9uXG4gIH0gZWxzZSBpZiAoZGVmYXVsdEV4cG9ydC5pc0tpbmQodHMuU3ludGF4S2luZC5GdW5jdGlvbkRlY2xhcmF0aW9uKSkge1xuICAgIHJldHVybiBkZWZhdWx0RXhwb3J0XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdVbmhhbmRsZWQgcGFnZSBjb21wb25lbnQgdHlwZTogJyArIChkZWZhdWx0RXhwb3J0IGFzIE5vZGUpLmdldEtpbmROYW1lKCkpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJldHVyblN0YXRlbWVudCh1cGRhdGVkU3RhdGU6IFBhZ2VTdGF0ZSkge1xuICBjb25zdCBlbGVtZW50cyA9IHVwZGF0ZWRTdGF0ZS5jb21wb25lbnRzU3RhdGUucmVkdWNlKChwcmV2LCBuZXh0KSA9PiB7XG4gICAgaWYgKCFuZXh0Lm1vZHVsZU5hbWUpIHtcbiAgICAgIHJldHVybiBwcmV2XG4gICAgfVxuICAgIGNvbnN0IGNvbXBvbmVudE1ldGFkYXRhID0gbW9kdWxlTmFtZVRvQ29tcG9uZW50TWV0YWRhdGFbbmV4dC5tb2R1bGVOYW1lXVtuZXh0Lm5hbWVdXG4gICAgaWYgKCFjb21wb25lbnRNZXRhZGF0YS5wcm9wU2hhcGUpIHtcbiAgICAgIHJldHVybiBwcmV2XG4gICAgfVxuICAgIHJldHVybiBwcmV2ICsgJ1xcbicgKyBjcmVhdGVKc3hTZWxmQ2xvc2luZ0VsZW1lbnQobmV4dC5uYW1lLCBjb21wb25lbnRNZXRhZGF0YS5wcm9wU2hhcGUsIG5leHQucHJvcHMpXG4gIH0sICcnKVxuICBjb25zdCBsYXlvdXRDb21wb25lbnROYW1lID0gdXBkYXRlZFN0YXRlLmxheW91dFN0YXRlLm5hbWVcbiAgcmV0dXJuIGByZXR1cm4gKFxcbjwke2xheW91dENvbXBvbmVudE5hbWV9PlxcbiR7ZWxlbWVudHN9XFxuPC8ke2xheW91dENvbXBvbmVudE5hbWV9PlxcbilgXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUpzeFNlbGZDbG9zaW5nRWxlbWVudChcbiAgZWxlbWVudE5hbWU6IHN0cmluZyxcbiAgcHJvcFNoYXBlOiBQcm9wU2hhcGUsXG4gIHByb3BzOiBQcm9wU3RhdGVcbikge1xuICBsZXQgZWwgPSBgPCR7ZWxlbWVudE5hbWV9IGBcbiAgT2JqZWN0LmtleXMocHJvcHMpLmZvckVhY2gocHJvcE5hbWUgPT4ge1xuICAgIGNvbnN0IHByb3BUeXBlID0gcHJvcFNoYXBlW3Byb3BOYW1lXS50eXBlXG4gICAgY29uc3QgdmFsID0gcHJvcHNbcHJvcE5hbWVdXG4gICAgaWYgKHByb3BUeXBlID09PSAnU3RyZWFtc1RlbXBsYXRlU3RyaW5nJykge1xuICAgICAgZWwgKz0gYCR7cHJvcE5hbWV9PXtcXGAke3ZhbH1cXGB9YFxuICAgIH0gZWxzZSBpZiAocHJvcFR5cGUgPT09ICdzdHJpbmcnIHx8IHByb3BUeXBlID09PSAnSGV4Q29sb3InKSB7XG4gICAgICBlbCArPSBgJHtwcm9wTmFtZX09JyR7dmFsfScgYFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIGhhbmRsZXMgYEpzeEVzcHJlc3Npb25gcywgbGlrZSBudW1iZXJzLCBib29sZWFucywgYW5kIGBTdHJlYW1zRGF0YVBhdGhgc1xuICAgICAgZWwgKz0gYCR7cHJvcE5hbWV9PXske3ZhbH19IGBcbiAgICB9XG4gIH0pXG4gIGVsICs9ICcvPidcbiAgcmV0dXJuIGVsXG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvb3NoaS9zdHVkaW8tcHJvdG90eXBlL3NyYy9zdHVkaW8udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL29zaGkvc3R1ZGlvLXByb3RvdHlwZS9zcmMvc3R1ZGlvLnRzXCI7ZXhwb3J0IGRlZmF1bHQge1xuICBucG1Db21wb25lbnRzOiB7XG4gICAgJ0B5ZXh0L3NlYXJjaC11aS1yZWFjdCc6IFsnU2VhcmNoQmFyJywgJ1VuaXZlcnNhbFJlc3VsdHMnXVxuICB9LFxuICBkaXJzOiB7XG4gICAgcGFnZXNEaXI6ICcuL3NyYy90ZW1wbGF0ZXMnICAgXG4gIH1cbn0iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGhcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGgvcGFyc2VOcG1Db21wb25lbnRzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGgvcGFyc2VOcG1Db21wb25lbnRzLnRzXCI7aW1wb3J0IHsgdHMgfSBmcm9tICd0cy1tb3JwaCdcbmltcG9ydCB7IGdldFNvdXJjZUZpbGUsIHBhcnNlUHJvcGVydHlTdHJ1Y3R1cmVzLCByZXNvbHZlTnBtTW9kdWxlIH0gZnJvbSAnLi9jb21tb24nXG5pbXBvcnQgeyBDb21wb25lbnRNZXRhZGF0YSwgTW9kdWxlTWV0YWRhdGEgfSBmcm9tICcuLi8uLi9zaGFyZWQvbW9kZWxzJ1xuaW1wb3J0IHBhcnNlQ29tcG9uZW50TWV0YWRhdGEgZnJvbSAnLi9wYXJzZUNvbXBvbmVudE1ldGFkYXRhJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuLyoqXG4gKiBQYXJzZXMgb3V0IHRoZSBwcm9wIHN0cnVjdHVyZSBmb3IgYSBwYXJ0aWN1bGFyIG5wbSBtb2R1bGUuXG4gKiBDdXJyZW50bHkgb25seSBzdXBwb3J0cyBmdW5jdGlvbmFsIHJlYWN0IGNvbXBvbmVudHMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlTnBtQ29tcG9uZW50cyhcbiAgbW9kdWxlTmFtZTogc3RyaW5nLFxuICBtYXRjaGVyczogKHN0cmluZyB8IFJlZ0V4cClbXVxuKTogTW9kdWxlTWV0YWRhdGEge1xuICBjb25zdCBhYnNQYXRoID0gcmVzb2x2ZU5wbU1vZHVsZShtb2R1bGVOYW1lKVxuICBjb25zdCBzb3VyY2VGaWxlID0gZ2V0U291cmNlRmlsZShhYnNQYXRoKVxuICAvLyBjb25zdCBpbXBvcnRJZGVudGlmaWVyID0gcmVzb2x2ZShtb2R1bGVOYW1lKVxuICBjb25zdCBpbXBvcnRJZGVudGlmaWVyID0gcGF0aC5yZXNvbHZlKCcvc3JjL3NlYXJjaC11aS1yZWFjdC1yZWV4cG9ydC50cycpXG5cbiAgLy8gV2UgbWF5IHdhbnQgdG8gbm90IHVzZSB0aGUgc2FtZSBvYmplY3QgcmVmZXJlbmNlIG92ZXIgaW4gdGhlIGZ1dHVyZVxuICAvLyBCdXQgZm9yIG5vdyB0aGlzIHNob3VsZCBuZXZlciBiZSBtdXRhdGVkXG4gIGNvbnN0IGVycm9yTWV0YWRhdGFWYWx1ZTogQ29tcG9uZW50TWV0YWRhdGEgPSB7XG4gICAgcHJvcFNoYXBlOiB7fSxcbiAgICBpbml0aWFsUHJvcHM6IHt9LFxuICAgIGVkaXRhYmxlOiBmYWxzZSxcbiAgICBpbXBvcnRJZGVudGlmaWVyXG4gIH1cbiAgY29uc3QgY29tcG9uZW50c1RvUHJvcHM6IE1vZHVsZU1ldGFkYXRhID0ge31cbiAgc291cmNlRmlsZS5nZXREZXNjZW5kYW50U3RhdGVtZW50cygpLmZvckVhY2gobiA9PiB7XG4gICAgaWYgKCFuLmlzS2luZCh0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb24pKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgY29tcG9uZW50TmFtZSA9IG4uZ2V0TmFtZSgpXG4gICAgaWYgKCFjb21wb25lbnROYW1lIHx8ICF0ZXN0Q29tcG9uZW50TmFtZShjb21wb25lbnROYW1lLCBtYXRjaGVycykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gbi5nZXRQYXJhbWV0ZXJzKClcbiAgICBpZiAocGFyYW1ldGVycy5sZW5ndGggIT09IDEpIHtcbiAgICAgIGlmIChwYXJhbWV0ZXJzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRm91bmQgJHtwYXJhbWV0ZXJzLmxlbmd0aH0gbnVtYmVyIG9mIGFyZ3VtZW50cyBmb3IgZnVuY3Rpb25hbCBjb21wb25lbnQgJHtjb21wb25lbnROYW1lfSwgZXhwZWN0ZWQgb25seSAxLiBJZ25vcmluZyB0aGlzIGNvbXBvbmVudCdzIHByb3BzLmApXG4gICAgICB9XG4gICAgICBjb21wb25lbnRzVG9Qcm9wc1tjb21wb25lbnROYW1lXSA9IGVycm9yTWV0YWRhdGFWYWx1ZVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHR5cGVOb2RlID0gcGFyYW1ldGVyc1swXS5nZXRUeXBlTm9kZSgpXG4gICAgaWYgKCF0eXBlTm9kZSkge1xuICAgICAgY29uc29sZS5lcnJvcihgTm8gdHlwZSBpbmZvcm1hdGlvbiBmb3VuZCBmb3IgXCIke2NvbXBvbmVudE5hbWV9XCIncyBwcm9wcy4gSWdub3JpbmcgdGhpcyBjb21wb25lbnQncyBwcm9wcy5gKVxuICAgICAgY29tcG9uZW50c1RvUHJvcHNbY29tcG9uZW50TmFtZV0gPSBlcnJvck1ldGFkYXRhVmFsdWVcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAodHlwZU5vZGUuaXNLaW5kKHRzLlN5bnRheEtpbmQuVHlwZUxpdGVyYWwpKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gdHlwZU5vZGUuZ2V0UHJvcGVydGllcygpLm1hcChwID0+IHAuZ2V0U3RydWN0dXJlKCkpXG4gICAgICBjb25zdCBwcm9wU2hhcGUgPSBwYXJzZVByb3BlcnR5U3RydWN0dXJlcyhwcm9wZXJ0aWVzLCBhYnNQYXRoKVxuICAgICAgY29tcG9uZW50c1RvUHJvcHNbY29tcG9uZW50TmFtZV0gPSB7XG4gICAgICAgIHByb3BTaGFwZSxcbiAgICAgICAgaW5pdGlhbFByb3BzOiB7fSxcbiAgICAgICAgaW1wb3J0SWRlbnRpZmllcixcbiAgICAgICAgZWRpdGFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVOb2RlLmlzS2luZCh0cy5TeW50YXhLaW5kLlR5cGVSZWZlcmVuY2UpKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUT0RPKG9zaGkpOiBjdXJyZW50bHkgYXNzdW1lcyB0aGF0IHRoZSBwcm9wIGludGVyZmFjZSBpcyBpbiB0aGUgc2FtZSBmaWxlIGFzIHRoZSBjb21wb25lbnQgaXRzZWxmXG4gICAgICAgIC8vIFRoaXMgaXMgbm90IG5lY2Vzc2FyaWx5IHRoZSBjYXNlLiBEZWZlcnJpbmcgdGhlIGltcG9ydCB0cmFjaW5nIGxvZ2ljIGZvciBub3csIHNpbmNlIGFuIGltcG9ydGVkXG4gICAgICAgIC8vIGludGVyZmFjZSBtYXkgbGl2ZSBzZXZlcmFsIGltcG9ydHMgZGVlcC5cbiAgICAgICAgY29uc3QgdHlwZU5hbWUgPSB0eXBlTm9kZS5nZXRUeXBlTmFtZSgpLmdldFRleHQoKVxuICAgICAgICBjb25zdCBjb21wb25lbnRNZXRhZGF0YSA9IHBhcnNlQ29tcG9uZW50TWV0YWRhdGEoc291cmNlRmlsZSwgYWJzUGF0aCwgdHlwZU5hbWUsIGltcG9ydElkZW50aWZpZXIpXG4gICAgICAgIGNvbXBvbmVudHNUb1Byb3BzW2NvbXBvbmVudE5hbWVdID0gY29tcG9uZW50TWV0YWRhdGFcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdDYXVnaHQgYW4gZXJyb3IsIGxpa2VseSB3aXRoIHJlZ2FyZHMgdG8gbmVzdGVkIGludGVyZmFjZXMuIElnbm9yaW5nIHByb3BzIGZvciAnLCBjb21wb25lbnROYW1lKVxuICAgICAgICBjb25zb2xlLmVycm9yKGVycilcbiAgICAgICAgY29tcG9uZW50c1RvUHJvcHNbY29tcG9uZW50TmFtZV0gPSBlcnJvck1ldGFkYXRhVmFsdWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcihgVW5oYW5kbGVkIHBhcmFtZXRlciB0eXBlIFwiJHt0eXBlTm9kZS5nZXRLaW5kTmFtZSgpfVwiIGZvdW5kIGZvciBcIiR7Y29tcG9uZW50TmFtZX1cIi4gSWdub3JpbmcgdGhpcyBjb21wb25lbnQncyBwcm9wcy5gKVxuICAgICAgY29tcG9uZW50c1RvUHJvcHNbY29tcG9uZW50TmFtZV0gPSBlcnJvck1ldGFkYXRhVmFsdWVcbiAgICB9XG4gIH0pXG4gIHJldHVybiBjb21wb25lbnRzVG9Qcm9wc1xufVxuXG4vKipcbiAqIFJlYWN0IGNvbXBvbmVudHMgbXVzdCBzdGFydCB3aXRoIGFuIHVwcGVyY2FzZSBsZXR0ZXIuIFdlIGNhbiB1c2UgdGhpcyBhcyBhIGZpcnN0XG4gKiBwYXNzIHRvIHJlZHVjZSBzb21lIG9mIHRoZSBwYXJzaW5nIHdlIGhhdmUgdG8gZG8uXG4gKlxuICogSXQgd291bGQgYmUgbW9yZSByb2J1c3QgdG8gYWxzbyBjaGVjayB0aGF0IHRoZSByZXR1cm4gdHlwZSBpcyBKU1guRWxlbWVudCBvciBzb21ldGhpbmcgb2YgdGhhdCBuYXR1cmUuXG4gKi9cbmZ1bmN0aW9uIGZpcnN0Q2hhcmFjdGVySXNVcHBlckNhc2UoY29tcG9uZW50TmFtZTogc3RyaW5nKSB7XG4gIHJldHVybiBjb21wb25lbnROYW1lWzBdID09PSBjb21wb25lbnROYW1lWzBdLnRvVXBwZXJDYXNlKClcbn1cblxuZnVuY3Rpb24gdGVzdENvbXBvbmVudE5hbWUoY29tcG9uZW50TmFtZTogc3RyaW5nLCBtYXRjaGVyczogKHN0cmluZyB8IFJlZ0V4cClbXSk6IGJvb2xlYW4ge1xuICBpZiAoIWZpcnN0Q2hhcmFjdGVySXNVcHBlckNhc2UoY29tcG9uZW50TmFtZSkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGZvciAoY29uc3QgbSBvZiBtYXRjaGVycykge1xuICAgIGlmICh0eXBlb2YgbSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChtID09PSBjb21wb25lbnROYW1lKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChtLnRlc3QoY29tcG9uZW50TmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvb3NoaS9zdHVkaW8tcHJvdG90eXBlL3N0dWRpby9zdHVkaW8tcGx1Z2luXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvb3NoaS9zdHVkaW8tcHJvdG90eXBlL3N0dWRpby9zdHVkaW8tcGx1Z2luL2NvbXBvbmVudE1ldGFkYXRhLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vY29tcG9uZW50TWV0YWRhdGEudHNcIjtpbXBvcnQgc3R1ZGlvQ29uZmlnIGZyb20gJy4uLy4uL3NyYy9zdHVkaW8nXG5pbXBvcnQgcGFyc2VOcG1Db21wb25lbnRzIGZyb20gJy4vdHMtbW9ycGgvcGFyc2VOcG1Db21wb25lbnRzJ1xuaW1wb3J0IHsgTW9kdWxlTWV0YWRhdGEsIE1vZHVsZU5hbWVUb0NvbXBvbmVudE1ldGFkYXRhIH0gZnJvbSAnLi4vc2hhcmVkL21vZGVscydcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBnZXRSb290UGF0aCBmcm9tICcuL2dldFJvb3RQYXRoJ1xuaW1wb3J0IHsgZ2V0U291cmNlRmlsZSB9IGZyb20gJy4vdHMtbW9ycGgvY29tbW9uJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBwYXJzZUNvbXBvbmVudE1ldGFkYXRhLCB7IHBhdGhUb1BhZ2VQcmV2aWV3IH0gZnJvbSAnLi90cy1tb3JwaC9wYXJzZUNvbXBvbmVudE1ldGFkYXRhJ1xuXG5jb25zdCBucG1Db21wb25lbnRQcm9wcyA9XG4gIE9iamVjdC5rZXlzKHN0dWRpb0NvbmZpZ1snbnBtQ29tcG9uZW50cyddKS5yZWR1Y2UoKHNoYXBlcywgbW9kdWxlTmFtZSkgPT4ge1xuICAgIGNvbnN0IG1hdGNoZXJzID0gc3R1ZGlvQ29uZmlnLm5wbUNvbXBvbmVudHNbbW9kdWxlTmFtZV1cbiAgICBzaGFwZXNbbW9kdWxlTmFtZV0gPSBwYXJzZU5wbUNvbXBvbmVudHMobW9kdWxlTmFtZSwgbWF0Y2hlcnMpXG4gICAgcmV0dXJuIHNoYXBlc1xuICB9LCB7fSBhcyBSZWNvcmQ8a2V5b2YgdHlwZW9mIHN0dWRpb0NvbmZpZ1snbnBtQ29tcG9uZW50cyddLCBNb2R1bGVNZXRhZGF0YT4pXG5cbmNvbnN0IGxvY2FsQ29tcG9uZW50cyA9IGZzLnJlYWRkaXJTeW5jKGdldFJvb3RQYXRoKCdzcmMvY29tcG9uZW50cycpLCAndXRmLTgnKS5yZWR1Y2UoKHByZXYsIGN1cnIpID0+IHtcbiAgY29uc3QgY29tcG9uZW50TmFtZSA9IGN1cnIuc3Vic3RyaW5nKDAsIGN1cnIubGFzdEluZGV4T2YoJy4nKSlcbiAgcHJldltjb21wb25lbnROYW1lXSA9IHBhcnNlQ29tcG9uZW50TWV0YWRhdGEoXG4gICAgZ2V0U291cmNlRmlsZShnZXRSb290UGF0aChgc3JjL2NvbXBvbmVudHMvJHtjdXJyfWApKSxcbiAgICBnZXRSb290UGF0aChgc3JjL2NvbXBvbmVudHMvJHtjdXJyfWApLFxuICAgIGAke2NvbXBvbmVudE5hbWV9UHJvcHNgXG4gIClcbiAgcmV0dXJuIHByZXZcbn0sIHt9KVxuXG5jb25zdCBsb2NhbExheW91dHMgPSBmcy5yZWFkZGlyU3luYyhnZXRSb290UGF0aCgnc3JjL2xheW91dHMnKSwgJ3V0Zi04JykucmVkdWNlKChwcmV2LCBjdXJyKSA9PiB7XG4gIGNvbnN0IGNvbXBvbmVudE5hbWUgPSBjdXJyLnN1YnN0cmluZygwLCBjdXJyLmxhc3RJbmRleE9mKCcuJykpXG4gIHByZXZbY29tcG9uZW50TmFtZV0gPSB7XG4gICAgZWRpdGFibGU6IGZhbHNlLFxuICAgIGltcG9ydElkZW50aWZpZXI6IHBhdGgucmVsYXRpdmUocGF0aFRvUGFnZVByZXZpZXcsIGdldFJvb3RQYXRoKGBzcmMvbGF5b3V0cy8ke2N1cnJ9YCkpXG4gIH1cbiAgcmV0dXJuIHByZXZcbn0sIHt9IGFzIE1vZHVsZU1ldGFkYXRhKVxuXG5leHBvcnQgY29uc3QgbW9kdWxlTmFtZVRvQ29tcG9uZW50TWV0YWRhdGE6IE1vZHVsZU5hbWVUb0NvbXBvbmVudE1ldGFkYXRhID0ge1xuICBsb2NhbENvbXBvbmVudHMsXG4gIC4uLmxvY2FsTGF5b3V0cyxcbiAgLi4ubnBtQ29tcG9uZW50UHJvcHNcbn0iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGhcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vdHMtbW9ycGgvdXBkYXRlU2l0ZVNldHRpbmdzRmlsZS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvb3NoaS9zdHVkaW8tcHJvdG90eXBlL3N0dWRpby9zdHVkaW8tcGx1Z2luL3RzLW1vcnBoL3VwZGF0ZVNpdGVTZXR0aW5nc0ZpbGUudHNcIjtpbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgeyB0cywgUHJvcGVydHlBc3NpZ25tZW50IH0gZnJvbSAndHMtbW9ycGgnXG5pbXBvcnQgeyBQcm9wU3RhdGUgfSBmcm9tICcuLi8uLi9zaGFyZWQvbW9kZWxzJ1xuaW1wb3J0IGdldFJvb3RQYXRoIGZyb20gJy4uL2dldFJvb3RQYXRoJ1xuaW1wb3J0IHsgZ2V0U291cmNlRmlsZSwgcHJldHRpZnkgfSBmcm9tICcuL2NvbW1vbidcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdXBkYXRlU2l0ZVNldHRpbmdzRmlsZSh1cGRhdGVkU3RhdGU6IFByb3BTdGF0ZSwgcGFnZUZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgY29uc3QgZmlsZSA9IGdldFJvb3RQYXRoKHBhZ2VGaWxlUGF0aClcbiAgY29uc3Qgc291cmNlRmlsZSA9IGdldFNvdXJjZUZpbGUoZmlsZSlcbiAgY29uc3Qgc2l0ZVNldHRpbmdzTm9kZSA9IHNvdXJjZUZpbGVcbiAgICAuZ2V0RGVzY2VuZGFudHNPZktpbmQodHMuU3ludGF4S2luZC5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbilcbiAgICAuZmluZChuID0+IG4uZ2V0Q29udGV4dHVhbFR5cGUoKT8uZ2V0U3ltYm9sKCk/LmdldE5hbWUoKSA9PT0gJ1NpdGVTZXR0aW5ncycpXG4gIGlmICghc2l0ZVNldHRpbmdzTm9kZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgTm8gc2l0ZSBzZXR0aW5ncyBvYmplY3QgZm91bmQgYXQgXCIke3BhZ2VGaWxlUGF0aH1cImApXG4gIH1cblxuICBzaXRlU2V0dGluZ3NOb2RlXG4gICAgLmdldFByb3BlcnRpZXMoKVxuICAgIC5maWx0ZXIoKHApOiBwIGlzIFByb3BlcnR5QXNzaWdubWVudCA9PiBwLmlzS2luZCh0cy5TeW50YXhLaW5kLlByb3BlcnR5QXNzaWdubWVudCkpXG4gICAgLmZvckVhY2gocCA9PiB7XG4gICAgICBjb25zdCBwcm9wTmFtZSA9IHAuZ2V0TmFtZSgpXG4gICAgICBjb25zdCBwcm9wTmV3VmFsdWUgPSB1cGRhdGVkU3RhdGVbcHJvcE5hbWVdXG4gICAgICBzaXRlU2V0dGluZ3NOb2RlLmFkZFByb3BlcnR5QXNzaWdubWVudCh7XG4gICAgICAgIG5hbWU6IHByb3BOYW1lLFxuICAgICAgICBpbml0aWFsaXplcjogdHlwZW9mIHByb3BOZXdWYWx1ZSA9PT0gJ3N0cmluZycgPyBgJyR7cHJvcE5ld1ZhbHVlfSdgIDogcHJvcE5ld1ZhbHVlLnRvU3RyaW5nKClcbiAgICAgIH0pXG4gICAgICBwLnJlbW92ZSgpXG4gICAgfSlcblxuICBjb25zdCB1cGRhdGVkRmlsZVRleHQgPSBwcmV0dGlmeShzb3VyY2VGaWxlLmdldEZ1bGxUZXh0KCkpXG4gIGZzLndyaXRlRmlsZVN5bmMocGFnZUZpbGVQYXRoLCB1cGRhdGVkRmlsZVRleHQpXG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vZ2V0UGFnZVBhdGgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL29zaGkvc3R1ZGlvLXByb3RvdHlwZS9zdHVkaW8vc3R1ZGlvLXBsdWdpbi9nZXRQYWdlUGF0aC50c1wiO2ltcG9ydCBzdHVkaW9Db25maWcgZnJvbSAnLi4vLi4vc3JjL3N0dWRpbydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZ2V0Um9vdFBhdGggZnJvbSAnLi9nZXRSb290UGF0aCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0UGFnZVBhdGgocGFnZUZpbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHBhdGhGcm9tU3JjID0gcGF0aC5qb2luKHN0dWRpb0NvbmZpZy5kaXJzPy5wYWdlc0RpciA/PyAnLi9zcmMvcGFnZXMnLCBwYWdlRmlsZSlcbiAgcmV0dXJuIGdldFJvb3RQYXRoKHBhdGhGcm9tU3JjKVxufSIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL29zaGkvc3R1ZGlvLXByb3RvdHlwZS9zdHVkaW8vc3R1ZGlvLXBsdWdpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL29zaGkvc3R1ZGlvLXByb3RvdHlwZS9zdHVkaW8vc3R1ZGlvLXBsdWdpbi9jb25maWd1cmVTZXJ2ZXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL29zaGkvc3R1ZGlvLXByb3RvdHlwZS9zdHVkaW8vc3R1ZGlvLXBsdWdpbi9jb25maWd1cmVTZXJ2ZXIudHNcIjtpbXBvcnQgeyBWaXRlRGV2U2VydmVyLCBXZWJTb2NrZXRDdXN0b21MaXN0ZW5lciwgV2ViU29ja2V0Q2xpZW50IH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IE1lc3NhZ2VJRCwgU3R1ZGlvRXZlbnRNYXAsIFJlc3BvbnNlRXZlbnRNYXAgfSBmcm9tICcuLi9zaGFyZWQvbWVzc2FnZXMnXG5pbXBvcnQgdXBkYXRlUGFnZUZpbGUgZnJvbSAnLi90cy1tb3JwaC91cGRhdGVQYWdlRmlsZSdcbmltcG9ydCB1cGRhdGVTaXRlU2V0dGluZ3NGaWxlIGZyb20gJy4vdHMtbW9ycGgvdXBkYXRlU2l0ZVNldHRpbmdzRmlsZSdcbmltcG9ydCBnZXRQYWdlUGF0aCBmcm9tICcuL2dldFBhZ2VQYXRoJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb25maWd1cmVTdHVkaW9TZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XG4gIC8qKiBSZWdpc3RlciBhIGxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gbWVzc2FnZUlkLCBpbmZlciBpdCdzIHBheWxvYWQgdHlwZSwgYW5kIHBlcmZvcm0gZXJyb3IgaGFuZGxpbmcgKi9cbiAgZnVuY3Rpb24gcmVnaXN0ZXJMaXN0ZW5lcjxUIGV4dGVuZHMgTWVzc2FnZUlEPihcbiAgICBtZXNzYWdlSWQ6IFQsXG4gICAgbGlzdGVuZXI6IChkYXRhOiBTdHVkaW9FdmVudE1hcFt0eXBlb2YgbWVzc2FnZUlkXSkgPT4gc3RyaW5nXG4gICkge1xuICAgIGNvbnN0IGhhbmRsZVJlczogV2ViU29ja2V0Q3VzdG9tTGlzdGVuZXI8U3R1ZGlvRXZlbnRNYXBbdHlwZW9mIG1lc3NhZ2VJZF0+ID0gKGRhdGEsIGNsaWVudCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbXNnID0gbGlzdGVuZXIoZGF0YSlcbiAgICAgICAgc2VuZENsaWVudE1zZyhjbGllbnQsIG1lc3NhZ2VJZCwgeyB0eXBlOiAnc3VjY2VzcycsIG1zZyB9KVxuICAgICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICAgIGNvbnN0IG1zZyA9IGUudG9TdHJpbmcoKVxuICAgICAgICBjb25zb2xlLmVycm9yKGUpXG4gICAgICAgIHNlbmRDbGllbnRNc2coY2xpZW50LCBtZXNzYWdlSWQsIHsgdHlwZTogJ2Vycm9yJywgbXNnIH0pXG4gICAgICB9XG4gICAgfVxuICAgIHNlcnZlci53cy5vbihtZXNzYWdlSWQsIGhhbmRsZVJlcylcbiAgfVxuXG4gIHJlZ2lzdGVyTGlzdGVuZXIoTWVzc2FnZUlELlVwZGF0ZVBhZ2VDb21wb25lbnRQcm9wcywgZGF0YSA9PiB7XG4gICAgY29uc3QgcGFnZVBhdGggPSBnZXRQYWdlUGF0aChkYXRhLnBhZ2VGaWxlKVxuICAgIHVwZGF0ZVBhZ2VGaWxlKGRhdGEuc3RhdGUsIHBhZ2VQYXRoKVxuICAgIHJldHVybiAnc3VjY2Vzc2Z1bGx5IGVkaXRlZDogJyArIHBhZ2VQYXRoXG4gIH0pXG5cbiAgcmVnaXN0ZXJMaXN0ZW5lcihNZXNzYWdlSUQuVXBkYXRlU2l0ZVNldHRpbmdzUHJvcHMsIGRhdGEgPT4ge1xuICAgIHVwZGF0ZVNpdGVTZXR0aW5nc0ZpbGUoZGF0YS5zdGF0ZSwgZGF0YS5wYXRoKVxuICAgIHJldHVybiAnc3VjY2Vzc2Z1bGx5IGVkaXRlZDogJyArIGRhdGEucGF0aFxuICB9KVxufVxuXG5mdW5jdGlvbiBzZW5kQ2xpZW50TXNnKFxuICBjbGllbnQ6IFdlYlNvY2tldENsaWVudCxcbiAgbWVzc2FnZUlkOiBNZXNzYWdlSUQsXG4gIHBheWxvYWQ6IFJlc3BvbnNlRXZlbnRNYXBbdHlwZW9mIG1lc3NhZ2VJZF1cbikge1xuICBjbGllbnQuc2VuZChtZXNzYWdlSWQsIHBheWxvYWQpXG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vY3JlYXRlU3R1ZGlvUGx1Z2luLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvc3R1ZGlvL3N0dWRpby1wbHVnaW4vY3JlYXRlU3R1ZGlvUGx1Z2luLnRzXCI7aW1wb3J0IHsgUGx1Z2luIH0gZnJvbSAndml0ZSdcbmltcG9ydCBwYXJzZUNvbXBvbmVudE1ldGFkYXRhIGZyb20gJy4vdHMtbW9ycGgvcGFyc2VDb21wb25lbnRNZXRhZGF0YSdcbmltcG9ydCBwYXJzZVNpdGVTZXR0aW5nc0ZpbGUgZnJvbSAnLi90cy1tb3JwaC9wYXJzZVNpdGVTZXR0aW5nc0ZpbGUnXG5pbXBvcnQgcGFyc2VQYWdlRmlsZSBmcm9tICcuL3RzLW1vcnBoL3BhcnNlUGFnZUZpbGUnXG5pbXBvcnQgY29uZmlndXJlU2VydmVyIGZyb20gJy4vY29uZmlndXJlU2VydmVyJ1xuaW1wb3J0IHsgU3R1ZGlvUHJvcHMgfSBmcm9tICcuLi9jbGllbnQvY29tcG9uZW50cy9TdHVkaW8nXG5pbXBvcnQgZ2V0Um9vdFBhdGggZnJvbSAnLi9nZXRSb290UGF0aCdcbmltcG9ydCB7IGdldFNvdXJjZUZpbGUgfSBmcm9tICcuL3RzLW1vcnBoL2NvbW1vbidcbmltcG9ydCB7IG1vZHVsZU5hbWVUb0NvbXBvbmVudE1ldGFkYXRhIH0gZnJvbSAnLi9jb21wb25lbnRNZXRhZGF0YSdcbmltcG9ydCBnZXRQYWdlUGF0aCBmcm9tICcuL2dldFBhZ2VQYXRoJ1xuaW1wb3J0IG9wZW5Ccm93c2VyIGZyb20gJ3JlYWN0LWRldi11dGlscy9vcGVuQnJvd3Nlci5qcydcblxuLyoqXG4gKiBIYW5kbGVzIHNlcnZlci1jbGllbnQgY29tbXVuaWNhdGlvbi5cbiAqXG4gKiBUaGlzIGluY2x1ZXMgcHJvdmlkaW5nIGEgdml0ZSB2aXJ0dWFsIG1vZHVsZSBzbyB0aGF0IHNlcnZlciBzaWRlIGRhdGEgY2FuIGJlIHBhc3NlZCB0byB0aGUgZnJvbnQgZW5kXG4gKiBmb3IgdGhlIGluaXRpYWwgbG9hZCwgYW5kIG1lc3NhZ2luZyB1c2luZyB0aGUgdml0ZSBITVIgQVBJLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVTdHVkaW9QbHVnaW4oYXJncyk6IFBsdWdpbiB7XG4gIGNvbnN0IHZpcnR1YWxNb2R1bGVJZCA9ICd2aXJ0dWFsOnlleHQtc3R1ZGlvJ1xuICBjb25zdCByZXNvbHZlZFZpcnR1YWxNb2R1bGVJZCA9ICdcXDAnICsgdmlydHVhbE1vZHVsZUlkXG5cbiAgY29uc3QgY3R4OiBTdHVkaW9Qcm9wcyA9IHtcbiAgICBzaXRlU2V0dGluZ3M6IHtcbiAgICAgIGNvbXBvbmVudE1ldGFkYXRhOiBwYXJzZUNvbXBvbmVudE1ldGFkYXRhKFxuICAgICAgICBnZXRTb3VyY2VGaWxlKGdldFJvb3RQYXRoKCdzcmMvc2l0ZVNldHRpbmdzLnRzJykpLFxuICAgICAgICBnZXRSb290UGF0aCgnc3JjL3NpdGVTZXR0aW5ncy50cycpLFxuICAgICAgICAnU2l0ZVNldHRpbmdzJ1xuICAgICAgKSxcbiAgICAgIHByb3BTdGF0ZTogcGFyc2VTaXRlU2V0dGluZ3NGaWxlKCdzcmMvc2l0ZVNldHRpbmdzLnRzJywgJ1NpdGVTZXR0aW5ncycpXG4gICAgfSxcbiAgICBtb2R1bGVOYW1lVG9Db21wb25lbnRNZXRhZGF0YSxcbiAgICBjb21wb25lbnRzT25QYWdlOiB7XG4gICAgICBpbmRleDogcGFyc2VQYWdlRmlsZShnZXRQYWdlUGF0aCgnaW5kZXgudHN4JykpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAneWV4dC1zdHVkaW8tdml0ZS1wbHVnaW4nLFxuICAgIGFzeW5jIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBpZiAoYXJncy5tb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmIGFyZ3MuY29tbWFuZCA9PT0gJ3NlcnZlJykge1xuICAgICAgICBvcGVuQnJvd3NlcignaHR0cDovL2xvY2FsaG9zdDozMDAwL3N0dWRpby9jbGllbnQvJylcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc29sdmVJZChpZCkge1xuICAgICAgaWYgKGlkID09PSB2aXJ0dWFsTW9kdWxlSWQpIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmVkVmlydHVhbE1vZHVsZUlkXG4gICAgICB9XG4gICAgfSxcbiAgICBsb2FkKGlkKSB7XG4gICAgICBpZiAoaWQgPT09IHJlc29sdmVkVmlydHVhbE1vZHVsZUlkKSB7XG4gICAgICAgIHJldHVybiBgZXhwb3J0IGRlZmF1bHQgJHtKU09OLnN0cmluZ2lmeShjdHgpfWBcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbmZpZ3VyZVNlcnZlclxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJSO0FBQzNSO0FBQ0E7OztBQ0RBOzs7QUNEc1Y7QUFDdFY7QUFDQTtBQUNBOzs7QUNNTyxJQUFNLG9CQUFvQixDQUFDLFlBQVkseUJBQXlCLGlCQUFpQjs7O0FDVDBRO0FBT25WLHNCQUFzQixNQUFxRDtBQUN4RixRQUFNLGFBQWEsT0FBTyxTQUFTLFdBQVcsY0FBYyxJQUFJLElBQUk7QUFDcEUsUUFBTSwwQkFBb0QsQ0FBQztBQUUzRCxhQUFXLHFCQUFxQixXQUFXLGlCQUFpQixFQUFFLFFBQVEsdUJBQXFCO0FBWDdGO0FBWUksVUFBTSxlQUFlLGtCQUFrQix5QkFBeUIsV0FBVyxZQUFZO0FBRXZGLFFBQUksQ0FBQyxjQUFjO0FBQ2pCO0FBQUEsSUFDRjtBQUNBLFVBQU0sZ0JBQW9DLG1CQUFhLGlCQUFpQixNQUE5QixtQkFBaUM7QUFDM0UsVUFBTSxlQUF5QixhQUFhLGdCQUFnQixFQUN6RCxJQUFJLE9BQUssRUFBRSxhQUFhLEtBQUssWUFBWSxTQUFTLENBQUM7QUFDdEQsVUFBTSxhQUFxQixrQkFBa0Isd0JBQXdCO0FBQ3JFLFFBQUksQ0FBQyx3QkFBd0IsYUFBYTtBQUN4Qyw4QkFBd0IsY0FBYyxDQUFDO0FBQUEsSUFDekM7QUFDQSw0QkFBd0IsWUFBWSxLQUFLLEdBQUcsWUFBWTtBQUN4RCxxQkFBaUIsd0JBQXdCLFlBQVksS0FBSyxhQUFhO0FBQUEsRUFDekUsQ0FBQztBQUNELFNBQU87QUFDVDs7O0FGdEJBO0FBTkEsSUFBTSxtQ0FBbUM7QUFVekMsSUFBTSxFQUFFLFNBQVMsc0JBQXNCO0FBRWhDLDJCQUNMLFlBQytDO0FBQy9DLFFBQU0sUUFBUSxXQUNYLGVBQWUsRUFDZixPQUFPLE9BQUs7QUFDWCxX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bkMsQ0FBQztBQUVELG1CQUFpQixnRUFBbUMsVUFBUTtBQUMxRCwyQkFBdUIsS0FBSyxPQUFPLEtBQUssSUFBSTtBQUM1QyxXQUFPLDBCQUEwQixLQUFLO0FBQUEsRUFDeEMsQ0FBQztBQUNIO0FBRUEsdUJBQ0UsUUFDQSxXQUNBLFNBQ0E7QUFDQSxTQUFPLEtBQUssV0FBVyxPQUFPO0FBQ2hDOzs7QUNqQ0E7QUFRZSw0QkFBNEIsTUFBYztBQUN2RCxRQUFNLGtCQUFrQjtBQUN4QixRQUFNLDBCQUEwQixPQUFPO0FBRXZDLFFBQU0sTUFBbUI7QUFBQSxJQUN2QixjQUFjO0FBQUEsTUFDWixtQkFBbUIsdUJBQ2pCLGNBQWMsWUFBWSxxQkFBcUIsQ0FBQyxHQUNoRCxZQUFZLHFCQUFxQixHQUNqQyxjQUNGO0FBQUEsTUFDQSxXQUFXLHNCQUFzQix1QkFBdUIsY0FBYztBQUFBLElBQ3hFO0FBQUEsSUFDQTtBQUFBLElBQ0Esa0JBQWtCO0FBQUEsTUFDaEIsT0FBTyxjQUFjLFlBQVksV0FBVyxDQUFDO0FBQUEsSUFDL0M7QUFBQSxFQUNGO0FBRUEsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sTUFBTSxhQUFhO0FBQ2pCLFVBQUksS0FBSyxTQUFTLGlCQUFpQixLQUFLLFlBQVksU0FBUztBQUMzRCxvQkFBWSxzQ0FBc0M7QUFBQSxNQUNwRDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFVBQVUsSUFBSTtBQUNaLFVBQUksT0FBTyxpQkFBaUI7QUFDMUIsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxLQUFLLElBQUk7QUFDUCxVQUFJLE9BQU8seUJBQXlCO0FBQ2xDLGVBQU8sa0JBQWtCLEtBQUssVUFBVSxHQUFHO0FBQUEsTUFDN0M7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDRjs7O0FoQnhEQSxJQUFNLG9DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWEsVUFBUTtBQUNsQyxTQUFPO0FBQUEsSUFDTCxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixtQkFBbUIsSUFBSTtBQUFBLElBQ3pCO0FBQUEsSUFDQSxNQUFNLE1BQUssUUFBUSxtQ0FBVyxJQUFJO0FBQUEsSUFDbEMsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLGVBQWU7QUFBQSxRQUNiLE9BQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

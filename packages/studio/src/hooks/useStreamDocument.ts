import { useLayoutEffect, useState } from "react";
import useStudioStore from "../store/useStudioStore";

export default function useStreamDocument() {
  const [activeEntityFile, localDataPath] = useStudioStore((store) => [
    store.pages.activeEntityFile,
    store.studioConfig.paths.localData,
  ]);
  const [document, setDocument] = useState<Record<string, unknown>>();
  const entityFilepath = `${localDataPath}/${activeEntityFile}`;

  useLayoutEffect(() => {
    import(/* @vite-ignore */ entityFilepath)
      .then((importedModule) => {
        setDocument(importedModule["default"] as Record<string, unknown>);
      })
      .catch(() => {
        console.error("Could not import stream document from:", entityFilepath);
      });
  }, [entityFilepath]);

  return document;
}

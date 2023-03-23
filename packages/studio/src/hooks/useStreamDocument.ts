import { useLayoutEffect, useState } from "react";
import useStudioStore from "../store/useStudioStore";

export default function useStreamDocument():
  | Record<string, unknown>
  | undefined {
  const [activeEntityFile, localDataPath] = useStudioStore((store) => [
    store.pages.activeEntityFile,
    store.studioConfig.paths.localData,
  ]);
  const [document, setDocument] = useState<Record<string, unknown>>();

  useLayoutEffect(() => {
    if (!activeEntityFile) {
      return;
    }
    const entityFilepath = `${localDataPath}/${activeEntityFile}`;
    import(/* @vite-ignore */ entityFilepath)
      .then((importedModule) => {
        setDocument(importedModule["default"] as Record<string, unknown>);
      })
      .catch(() => {
        console.error("Could not import stream document from:", entityFilepath);
      });
  }, [activeEntityFile, localDataPath]);

  return document;
}

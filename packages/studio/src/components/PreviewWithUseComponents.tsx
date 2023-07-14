import useImportedComponents from "../hooks/useImportedComponents";
import useStudioStore from "../store/useStudioStore";
import PreviewPanel from "./PreviewPanel";
import Highlighter from "./Highlighter";
import IFramePortal from './IFramePortal';

export default function PreviewWithUseComponents() {
  const componentTree = useStudioStore((store) =>
    store.actions.getComponentTree()
  );
  void useImportedComponents(componentTree);

  return (
    <IFramePortal className='h-full w-full'>
      <PreviewPanel />
      <Highlighter />
      <link href="/src/tailwind-full.css.br" rel="stylesheet"/>
    </IFramePortal>
  );
}

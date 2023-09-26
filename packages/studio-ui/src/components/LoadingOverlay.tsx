import { CSSProperties, PropsWithChildren, useEffect, useMemo } from 'react';
import loadComponents from '../utils/loadComponents';
import classNames from 'classnames';
import useStudioStore from '../store/useStudioStore';

export default function LoadingOverlay(props: PropsWithChildren) {
  const [totalCount, loadedCount] = useStudioStore(store => [
    Object.keys(store.fileMetadatas.UUIDToFileMetadata).length,
    Object.keys(store.fileMetadatas.UUIDToImportedComponent).length
  ]);
  const finishedLoading = loadedCount === totalCount

  useEffect(() => {
    loadComponents();
  }, []);

  const appClassname = classNames('transition-opacity delay-1000 duration-1000', {
    'opacity-100': finishedLoading,
    'opacity-0 invisible': !finishedLoading
  })

  const overlayClassname = classNames('transition-opacity delay-1000 duration-1000 h-full w-full fixed flex justify-center items-center flex-col', {
    'opacity-100': !finishedLoading,
    'opacity-0': finishedLoading
  })

  return (
    <>
      <div className={overlayClassname}>
        <ProgressBar progressFraction={loadedCount/totalCount}/>
        <div className='text-slate-800'>
          loading components... ({loadedCount}/{totalCount})
        </div>
      </div>
      <div className={appClassname}>{props.children}</div>
    </>
  )
}

function ProgressBar(props: {
  progressFraction: number
}) {

  const progressStyles: CSSProperties = useMemo(() => {
    return {
      width: `${Math.ceil(props.progressFraction * 100)}%`,
      transition: `width ${Math.floor(2 - props.progressFraction)}s ease-out`
    }
  }, [props.progressFraction]) 

  return (
    <div className='w-9/12 bg-indigo-200 h-8 rounded items-center flex'>
      <div className='bg-indigo-400 h-full rounded-l' style={progressStyles}></div>
    </div>
  )
}

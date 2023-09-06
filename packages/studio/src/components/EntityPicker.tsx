import { ChangeEvent, useCallback } from "react";
import useStudioStore from "../store/useStudioStore";
import getSelectCssClasses from "../utils/getSelectCssClasses";
import Divider from "./common/Divider";

export default function EntityPicker(): JSX.Element | null {
  const [
    isEntityPage,
    activePageEntities,
    activeEntityFile,
    setActiveEntityFile,
  ] = useStudioStore((store) => [
    !!store.pages.getActivePageState()?.pagesJS?.streamScope,
    store.pages.activePageEntities,
    store.pages.activeEntityFile,
    store.pages.setActiveEntityFile,
  ]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setActiveEntityFile(e.target.value);
    },
    [setActiveEntityFile]
  );

  if (!isEntityPage || !activePageEntities) {
    return null;
  }

  return (
    <>
      <label className="text-sm">
        <div className="mb-1">Entity</div>
        <select
          className={getSelectCssClasses("w-full mb-6")}
          value={activeEntityFile}
          onChange={handleChange}
        >
          {Object.entries(activePageEntities).map(([fileName, data]) => (
            <option key={fileName} value={fileName}>
              {`${data.name} (id: ${data.id})`}
            </option>
          ))}
        </select>
      </label>
      <Divider />
    </>
  );
}

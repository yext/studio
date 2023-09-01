import { ChangeEvent, useCallback } from "react";
import useStudioStore from "../store/useStudioStore";
import Divider from "./common/Divider";
import { twMerge } from "tailwind-merge";
import { selectCssClasses } from "./UnionPropInput";

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

  const selectClasses = twMerge(selectCssClasses, "w-full mb-6");

  return (
    <>
      <label className="text-sm">
        <div className="mb-1">Entity</div>
        <select
          className={selectClasses}
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

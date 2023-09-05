import { ChangeEvent, useCallback, useState } from "react";
import useStudioStore from "../store/useStudioStore";
import { twMerge } from "tailwind-merge";
import { selectCssClasses } from "./UnionPropInput";
import Select from 'react-select';
import sendMessage from "../messaging/sendMessage";
import { MessageID, ResponseType } from "@yext/studio-plugin";
import { cloneDeep } from "lodash";

async function fetchEntities(entityType: string, pageNum: number) {
  const entitiesResponse = await sendMessage(MessageID.GetEntities, {
    entityType,
    pageNum,
  }, { hideSuccessToast: true });
  if (entitiesResponse.type === ResponseType.Success) {
    return entitiesResponse.entities;
  }
  return { entities: [], totalCount: 0 };
}

export default function EntityPicker(): JSX.Element | null {
  const [
    isEntityPage,
    activePageEntities,
    activeEntityFile,
    setActiveEntityFile,
    setActivePageEntities
  ] = useStudioStore((store) => [
    !!store.pages.getActivePageState()?.pagesJS?.streamScope,
    store.pages.activePageEntities,
    store.pages.activeEntityFile,
    store.pages.setActiveEntityFile,
    store.pages.setActivePageEntities
  ]);

  const [pageCount, setPageCount] = useState(0);

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
  const options = Object.entries(activePageEntities).map(([fileName, data]) => {
    return {
      value: fileName,
      label: `${data.name} (id: ${data.id})`
    }
  });

  return (
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
  );
}

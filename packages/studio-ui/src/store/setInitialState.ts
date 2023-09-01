import { GitData, StudioData } from "@yext/studio-plugin";
import useStudioStore from "./useStudioStore";
import { merge } from "lodash"
import removeTopLevelFragments from "../utils/removeTopLevelFragments";

export default function setInitialState(initialStudioData: StudioData, gitData: GitData) {
  const firstPageEntry = Object.entries(
    initialStudioData.pageNameToPageState
  )?.sort()[0];

  const stateFromStudioData = {
    pages: {
      pages: removeTopLevelFragments(initialStudioData.pageNameToPageState),
      errorPages: initialStudioData.pageNameToErrorPageState,
      activePageName: firstPageEntry?.[0],
      activeEntityFile: firstPageEntry?.[1]?.pagesJS?.entityFiles?.[0],
    },
    studioEnvData: {
      isWithinCBD: initialStudioData.isWithinCBD,
    },
    studioConfig: {
      paths: initialStudioData.studioConfig?.paths,
      isPagesJSRepo: initialStudioData.studioConfig?.isPagesJSRepo,
    },
    siteSettings: {
      shape: initialStudioData.siteSettings?.shape,
      values: initialStudioData.siteSettings?.values,
    },
    previousSave: {
      siteSettings: {
        values: initialStudioData.siteSettings?.values,
      },
      fileMetadatas: {
        UUIDToFileMetadata: initialStudioData.UUIDToFileMetadata,
      },
    },
    fileMetadatas: {
      UUIDToFileMetadata: removeTopLevelFragments(
        initialStudioData.UUIDToFileMetadata
      ),
    },
    gitData
  }

  const initialState = merge({}, useStudioStore.getState(), stateFromStudioData)
  useStudioStore.setState(initialState);
}

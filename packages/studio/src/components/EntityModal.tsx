import useStudioStore from "../store/useStudioStore";
import { useCallback, useMemo } from "react";
import FormModal, { FormData } from "./common/FormModal";
import { GetPathVal, PropValueKind, StreamScope } from "@yext/studio-plugin";
import TemplateExpressionFormatter from "../utils/TemplateExpressionFormatter";
import StreamScopeFormatter, { StreamScopeForm } from "../utils/StreamScopeFormatter";
import { PageSettings, getUrlDisplayValue } from "./PageSettingsButton";

interface EntityModalProps {
   pageName: string;
   isOpen: boolean;
   handleClose: () => void | Promise<void>;
}

export default function EntityModal({
   pageName,
   isOpen,
   handleClose,
}: EntityModalProps): JSX.Element {
   const [
      currGetPathValue,
      updateGetPathValue,
      streamScope,
      updateStreamScope,
   ] = useStudioStore((store) => [
      store.pages.pages[pageName].pagesJS?.getPathValue,
      store.pages.updateGetPathValue,
      store.pages.pages[pageName].pagesJS?.streamScope,
      store.pages.updateStreamScope,
   ]);

   const entityFormData: FormData<PageSettings & StreamScopeForm> = {
      url: { 
         description: "URL slug:",
         optional: !currGetPathValue,
         placeholder: currGetPathValue ? "" : "URL slug is defined by developer",
      },
      entityIds: {
         description: "Entity IDs:",
         optional: true,
      },
      entityTypes: {
         description: "Entity Types:",
         optional: true,
      },
      savedFilterIds: {
         description: "Saved Filter IDs:",
         optional: true,
      },
   };

   const initialFormValue: PageSettings & StreamScopeForm = useMemo(
      () => ({
         url: getUrlDisplayValue(currGetPathValue, true),
         ...(streamScope && StreamScopeFormatter.displayStreamScope(streamScope)),
      }),
      [currGetPathValue, streamScope]
   );

   const handleModalSave = useCallback(
      (form: PageSettings & StreamScopeForm) => {
         const getPathValue: GetPathVal = {
            kind: PropValueKind.Expression,
            value: TemplateExpressionFormatter.getRawValue(form.url),
         };
         updateGetPathValue(pageName, getPathValue);
         updateStreamScope(pageName, StreamScopeFormatter.readStreamScope(form));
         return true;
      },
      [updateGetPathValue, updateStreamScope, pageName, currGetPathValue]
   );

   return (<FormModal
      isOpen={isOpen}
      title="Page Settings"
      instructions={"Changing the scope of the stream (entity IDs, entity types, and saved filter IDs) may cause entity data to be undefined."}
      formData={entityFormData}
      initialFormValue={initialFormValue}
      requireChangesToSubmit={true}
      handleClose={handleClose}
      handleConfirm={handleModalSave}
      transformOnChangeValue={TemplateExpressionFormatter.convertCurlyBracesToSquareBrackets}
   />)
};
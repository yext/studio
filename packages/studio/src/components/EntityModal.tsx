import useStudioStore from "../store/useStudioStore";
import { useCallback, useMemo } from "react";
import FormModal, { FormData } from "./common/FormModal";
import { GetPathVal, PropValueKind, StreamScope } from "@yext/studio-plugin";
import TemplateExpressionFormatter from "../utils/TemplateExpressionFormatter";
import StreamScopeFormatter, { StreamScopeForm } from "../utils/StreamScopeFormatter";
import { getUrlDisplayValue, PageSettingsModalProps } from "./PageSettingsButton";
import { StaticPageSettings } from "./StaticModal";

type EntityPageSettings = StaticPageSettings & StreamScopeForm;

const entityFormData: FormData<EntityPageSettings> = {
   url: { 
      description: "URL slug:",
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

export default function EntityModal({
   pageName,
   isOpen,
   handleClose,
}: PageSettingsModalProps): JSX.Element {
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

   entityFormData.url.optional = !currGetPathValue;
   entityFormData.url.placeholder = currGetPathValue ? "" : "URL slug is defined by developer";

   const initialFormValue: EntityPageSettings = useMemo(
      () => ({
         url: getUrlDisplayValue(currGetPathValue, true),
         ...(streamScope && StreamScopeFormatter.displayStreamScope(streamScope)),
      }),
      [currGetPathValue, streamScope]
   );

   const handleModalSave = useCallback(
      (form: EntityPageSettings) => {
         const getPathValue: GetPathVal = {
            kind: PropValueKind.Expression,
            value: TemplateExpressionFormatter.getRawValue(form.url),
         };
         updateGetPathValue(pageName, getPathValue);
         updateStreamScope(pageName, StreamScopeFormatter.readStreamScope(form));
         return true;
      },
      [updateGetPathValue, updateStreamScope, pageName]
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
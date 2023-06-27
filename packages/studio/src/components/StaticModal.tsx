import useStudioStore from "../store/useStudioStore";
import { useCallback, useMemo } from "react";
import FormModal, { FormData } from "./common/FormModal";
import { GetPathVal, PropValueKind } from "@yext/studio-plugin";
import { PageSettings, getUrlDisplayValue, PageSettingsModalProps } from "./PageSettingsButton";

const staticFormData: FormData<PageSettings> = {
	url: { 
		description: "URL slug:",
	},
};

export default function StaticModal({
	pageName,
	isOpen,
	handleClose,
}: PageSettingsModalProps): JSX.Element {
	const [
		currGetPathValue,
		updateGetPathValue,
	] = useStudioStore((store) => [
		store.pages.pages[pageName].pagesJS?.getPathValue,
		store.pages.updateGetPathValue,
	]);

   staticFormData.url.placeholder = currGetPathValue ? "" : "URL slug is defined by developer";

	const initialFormValue: PageSettings = useMemo(
		() => ({ url: getUrlDisplayValue(currGetPathValue, false) }),
		[currGetPathValue]
	);

	const handleModalSave = useCallback(
		(form: PageSettings) => {
			const getPathValue: GetPathVal = {
				kind: PropValueKind.Literal,
				value: form.url,
			};
			updateGetPathValue(pageName, getPathValue);
			return true;
		},
		[updateGetPathValue, pageName]
	);

	return (<FormModal
		isOpen={isOpen}
		title="Page Settings"
		formData={staticFormData}
		initialFormValue={initialFormValue}
		requireChangesToSubmit={true}
		handleClose={handleClose}
		handleConfirm={handleModalSave}
		transformOnChangeValue={undefined}
	/>)
}
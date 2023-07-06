import { useCallback, useContext } from "react";
import FormModal, { FormData } from "../common/FormModal";
import { FlowStepModalProps } from "./FlowStep";
import AddPageContext from "./AddPageContext";
import StreamScopeParser, {
  StreamScopeForm,
} from "../../utils/StreamScopeParser";

const formData: FormData<StreamScopeForm> = {
  entityIds: {
    description: "Entity IDs",
    optional: true,
    tooltip: "In the Yext platform, navigate to Content > Entities",
  },
  entityTypes: {
    description: "Entity Type IDs",
    optional: true,
    tooltip:
      "In the Yext platform, navigate to Content > Configuration > Entity Types", //todo: update EntitypageModal
  },
  savedFilterIds: {
    description: "Saved Filter IDs",
    optional: true,
    tooltip:
      "In the Yext platform, navigate to Content > Configuration > Saved Filters",
  },
};

export default function StreamScopeCollector({
  isOpen,
  handleClose,
  handleConfirm,
}: FlowStepModalProps) {
  const { actions } = useContext(AddPageContext);

  const onConfirm = useCallback(
    async (data: StreamScopeForm) => {
      const streamScope = StreamScopeParser.parseStreamScope(data);
      actions.setStreamScope(streamScope);
      await handleConfirm();
      return true;
    },
    [handleConfirm, actions]
  );

  return (
    <FormModal
      isOpen={isOpen}
      title="Content Scope"
      instructions="Use the optional fields below to specify which entities this page can access. Values should be separated by commas."
      formData={formData}
      closeOnConfirm={false}
      confirmButtonText="Next"
      handleClose={handleClose}
      handleConfirm={onConfirm}
    />
  );
}

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
    tooltip: "On Yext, navigate to Knowledge Graph > Entities.",
  },
  entityTypes: {
    description: "Entity Type IDs",
    optional: true,
    tooltip:
      "On Yext, navigate to Knowledge Graph > Configuration > Entity Types and then select an entity type.", //TODO: this doesn't fit in the modal box
  },
  savedFilterIds: {
    description: "Saved Filter IDs",
    optional: true,
    tooltip:
      "On Yext, navigate to Knowledge Graph > Configuration > Saved Filters.",
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
      title="Specify the Entities"
      instructions="Use the optional fields below to specify which entities this page will use. Values should be separated by commas."
      formData={formData}
      closeOnConfirm={false}
      confirmButtonText="Next"
      handleClose={handleClose}
      handleConfirm={onConfirm}
    />
  );
}

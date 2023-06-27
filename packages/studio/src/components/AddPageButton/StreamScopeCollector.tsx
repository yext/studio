import { useCallback, useContext } from "react";
import FormModal, { FormData } from "../common/FormModal";
import { FlowStepModalProps } from "./FlowStep";
import AddPageContext from "./AddPageContext";
import StreamScopeFormatter, {
  StreamScopeForm,
} from "../../utils/StreamScopeFormatter";

const formData: FormData<StreamScopeForm> = {
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

export default function StreamScopeCollector({
  isOpen,
  handleClose,
  handleConfirm,
}: FlowStepModalProps) {
  const { actions } = useContext(AddPageContext);

  const onConfirm = useCallback(
    async (data: StreamScopeForm) => {
      const streamScope = StreamScopeFormatter.readStreamScope(data);
      actions.setStreamScope(streamScope);
      await handleConfirm();
      return true;
    },
    [handleConfirm, actions]
  );

  return (
    <FormModal
      isOpen={isOpen}
      title="Specify the Stream Scope"
      instructions="Use the optional fields below to define the scope of the
        stream for the entity page. Values should be separated by commas."
      formData={formData}
      closeOnConfirm={false}
      confirmButtonText="Next"
      handleClose={handleClose}
      handleConfirm={onConfirm}
    />
  );
}

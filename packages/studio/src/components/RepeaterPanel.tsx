import { TypeGuards } from "@yext/studio-plugin";
import Divider from "./common/Divider";
import useActiveComponent from "../hooks/useActiveComponent";
import MessageBubble from "./common/MessageBubble";

export default function RepeaterPanel() {
  const { activeComponentState } = useActiveComponent();
  if (
    !activeComponentState ||
    !TypeGuards.isRepeaterState(activeComponentState)
  ) {
    return null;
  }

  return (
    <div className="mt-6">
      <Divider />
      <MessageBubble message="This component is repeated in a list. Please contact a developer to edit the list settings." />
    </div>
  );
}

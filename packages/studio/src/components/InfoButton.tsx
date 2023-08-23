import { version } from "../../package.json";
import { ReactComponent as Info } from "../icons/info.svg";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import Modal from "./common/Modal";

const infoSVG = <Info className="h-7" />;
const body = (
  <div>
    <p className="font-bold mb-4"> Studio Info</p>
    Studio Verison: {version}
  </div>
);

const renderModal: renderModalFunction = (isOpen, handleClose) => {
  return (
    <Modal
      isOpen={isOpen}
      body={body}
      title="Studio Info"
      handleClose={handleClose}
    />
  );
};

/**
 * Renders an info modal including the current Studio version
 */
export default function InfoButton() {
  return (
    <ButtonWithModal
      buttonContent={infoSVG}
      buttonClassName="pt-2"
      renderModal={renderModal}
    />
  );
}

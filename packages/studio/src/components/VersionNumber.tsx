import { useCallback } from "react";
import { version } from "../../package.json";
import { ReactComponent as Info } from "../icons/info.svg";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import ReactModal from "react-modal";

const customReactModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "50%",
    bottom: "auto",
    marginRight: "-95%",
    maxWidth: "600px",
    transform: "translate(-50%, -50%)",
  },
  overlay: {
    zIndex: 1000,
  },
};
const infoSVG = <Info className="h-7" />;

/**
 * Renders the current version number
 */
export default function VersionNumber() {

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      return (
        <ReactModal
          isOpen={isOpen}
          onRequestClose={handleClose}
          contentLabel="Studio Info"
          style={customReactModalStyles}
          ariaHideApp={false}
          shouldCloseOnEsc={true}
          shouldCloseOnOverlayClick={true}
          role="dialog"
        >
          <p className="font-bold mb-4"> Studio Info</p>
          Studio Verison: {version}
        </ReactModal>
      );
    },
    []
  );

  return (
      <ButtonWithModal
        buttonContent={infoSVG}
        buttonClassName="pt-2"
        renderModal={renderModal}
      />
  );
}

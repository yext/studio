import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useContext,
  useState,
} from "react";
import NewPageContext from "./NewPageContext";
import Modal from "../common/Modal";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
}

export default function PageTypeSelector({
  isOpen,
  handleClose,
  handleConfirm,
}: Props) {
  const { state, actions } = useContext(NewPageContext);
  const [isStatic, setIsStatic] = useState(state.isStatic);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      actions.setIsStatic(isStatic);
    },
    [actions, isStatic]
  );

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setIsStatic(e.target.innerText === "Static");
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      handleClose={handleClose}
      handleConfirm={handleConfirm}
      title="Select Page Type"
      body={renderForm(handleSubmit, handleChange)}
    />
  );
}

function renderForm(onSubmit, onChange) {
  return (
    <form onSubmit={onSubmit}>
      <input type="radio" onChange={onChange}>
        Static
      </input>
      <input type="radio" onChange={onChange}>
        Entity Template
      </input>
    </form>
  );
}

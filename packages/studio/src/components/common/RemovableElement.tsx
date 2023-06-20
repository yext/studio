import { ReactComponent as X } from "../../icons/x.svg";

export interface RemovableElementProps {
  children: JSX.Element,
  onRemove: () => void,
  buttonClasses?: string
}

export default function RemovableElement(props: RemovableElementProps) {
  const { children, onRemove, buttonClasses } = props;
  
  return (
    <div className="flex flex-row w-full">
      {children}
      <button onClick={onRemove} className={buttonClasses}>
        <X/>
      </button>
    </div>
  );
}
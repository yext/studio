import ElementIcon, { ElementType } from "../common/ElementIcon";

export default function AddElementOption({
  displayName,
  handleSelect,
  elementType,
}: {
  displayName: string;
  handleSelect?: () => void;
  elementType: ElementType;
}) {
  return (
    <button
      className="flex items-center gap-x-2 px-6 py-2 cursor-pointer hover:bg-gray-100 w-full text-left"
      onClick={handleSelect}
      aria-label={`Add ${displayName} Element`}
    >
      <ElementIcon elementType={elementType} /> 
      {displayName}
    </button>
  );
}

export default function AddElementOption({
  displayName,
  handleSelect,
  icon,
}: {
  displayName: string;
  handleSelect?: () => void;
  icon: JSX.Element | null;
}) {
  return (
    <button
      className="flex items-center gap-x-2 px-6 py-2 cursor-pointer hover:bg-gray-100 w-full text-left"
      onClick={handleSelect}
      aria-label={`Add ${displayName} Element`}
    >
      {icon}
      {displayName}
    </button>
  );
}

import { useCallback, useState } from "react";
import { useComposedCssClasses } from "../../hooks/useComposedCssClasses";

interface OptionPickerProps<T extends string> {
  defaultOption: T;
  options: Record<string, T>;
  icons?: Record<T, JSX.Element>;
  onSelect: (option: T) => void;
  customCssClasses?: OptionPickerCssClasses;
}

interface OptionPickerCssClasses extends OptionCssClasses {
  container?: string;
}

const builtInCssClasses: OptionPickerCssClasses = {
  container: "min-w-fit bg-gray-300 flex flex-row p-1 rounded-md mb-6",
  option: "flex items-center justify-center grow rounded-md p-2 text-gray-500",
  selectedOption:
    "flex items-center justify-center grow rounded-md p-2 drop-shadow bg-white",
};

export default function OptionPicker<T extends string>({
  options,
  icons,
  defaultOption,
  onSelect,
  customCssClasses,
}: OptionPickerProps<T>) {
  const [selectedOption, setOption] = useState<T>(defaultOption);
  const onClick = useCallback(
    (option: T) => {
      setOption(option);
      onSelect(option);
    },
    [onSelect]
  );

  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses);

  return (
    <nav className={cssClasses.container}>
      {Object.values(options).map((option, index: number) => {
        return (
          <Option
            key={index}
            option={option}
            icon={icons?.[option]}
            isSelected={option === selectedOption}
            onClick={onClick}
            cssClasses={cssClasses}
          />
        );
      })}
    </nav>
  );
}

interface OptionCssClasses {
  option?: string;
  selectedOption?: string;
}

interface OptionProps<T extends string> {
  option: T;
  icon?: JSX.Element;
  isSelected: boolean;
  onClick: (option: T) => void;
  cssClasses?: OptionCssClasses;
}

function Option<T extends string>({
  option,
  icon,
  onClick,
  isSelected,
  cssClasses,
}: OptionProps<T>) {
  const onClickCallback = useCallback(() => {
    onClick(option);
  }, [onClick, option]);
  return (
    <button
      key={option}
      onClick={onClickCallback}
      className={isSelected ? cssClasses?.selectedOption : cssClasses?.option}
      aria-label={option}
    >
      {icon && <div className="mr-2">{icon}</div>}
    </button>
  );
}

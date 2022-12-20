import { useCallback, useState } from "react"
import { useComposedCssClasses } from "../../hooks/useComposedCssClasses"

interface OptionPickerProps<T> {
  defaultOption: T
  options: Record<string, T>,
  icons?: JSX.Element[],
  onSelect: (option: T) => void,
  customCssClasses?: OptionPickerCssClasses
}

interface OptionPickerCssClasses extends OptionCssClasses {
  container?: string,
}

const builtInCssClasses: OptionPickerCssClasses = {
  container: 'min-w-fit bg-gray-300 flex flex-row p-1 rounded-md mb-10',
  option: 'flex items-center justify-center grow rounded-md p-2 text-gray-500',
  selectedOption: 'flex items-center justify-center grow rounded-md p-2 drop-shadow bg-white'
}

export default function OptionPicker<T>({
  options,
  icons,
  defaultOption,
  onSelect,
  customCssClasses
}: OptionPickerProps<T>) {
  const [selectedOption, setOption] = useState<T>(defaultOption)
  const onClick = useCallback((option: T) => {
    setOption(option)
    onSelect(option)
  }, [onSelect])

  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses)

  return <nav className={cssClasses.container}>
    {Object.entries(options).map(([label, option], index) =>
      <Option key={index} option={option} label={label} icon={icons?.[index]} isSelected={option === selectedOption} onClick={onClick} customCssClasses={cssClasses}/>
    )}
  </nav>
}

interface OptionCssClasses {
  option?: string,
  selectedOption?: string
}

interface OptionProps<T> {
  option: T,
  label: string,
  icon?: JSX.Element,
  isSelected: boolean,
  onClick: (option: T) => void,
  customCssClasses?: OptionCssClasses
}

function Option<T>({ option, label, icon, onClick, isSelected, customCssClasses }: OptionProps<T>) {
  const onClickCallback = useCallback(() => {
    onClick(option)
  }, [onClick, option])
  return <button
      key={label}
      onClick={onClickCallback}
      className={isSelected ? customCssClasses?.selectedOption : customCssClasses?.option}
    >
      {icon && <div className="mr-2">{icon}</div>}
      {label}
    </button>
}
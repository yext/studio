import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { generateTailwindSafelist } from "@yext/studio-plugin";
import { StudioTailwindTheme } from "@yext/studio-plugin";
import { ReactComponent as EmbedIcon } from "../icons/embed.svg";
import { ReactComponent as X } from "../icons/x.svg";
import { useRootClose } from "@restart/ui";
import classNames from "classnames";

const customClassesPromise: Promise<string[] | undefined> = import(
  "@pathToUserProjectRoot/tailwind.config"
)
  .then((module) => {
    const theme: StudioTailwindTheme | undefined =
      module.default?.theme?.extend;
    return theme && generateTailwindSafelist(theme);
  })
  .catch((e) => {
    console.error(e);
    return undefined;
  });

interface Props {
  onChange: (value: string) => void;
  value: string;
  disabled: boolean;
}

export default function TailwindPropInput({
  onChange,
  value,
  disabled,
}: Props) {
  const availableClasses = useAvailableTailwindClasses(value);
  const hasAvailableClasses = !!availableClasses?.length;
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && !hasAvailableClasses) {
      setIsOpen(false);
    }
  }, [isOpen, hasAvailableClasses]);

  useRootClose(ref, () => {
    setIsOpen(false);
  });

  const toggleOpen = useCallback(() => setIsOpen((isOpen) => !isOpen), []);
  const addTailwindClass = useCallback(
    (tailwindClass: string) => {
      setIsOpen(false);
      const tailwindClasses = new Set(splitValue(value));
      tailwindClasses.add(tailwindClass);
      const combinedClass = [...tailwindClasses].join(" ");
      onChange(combinedClass);
    },
    [onChange, value]
  );

  const removeTailwindClass = useCallback(
    (tailwindClass: string) => {
      setIsOpen(false);
      const tailwindClasses = new Set(splitValue(value));
      tailwindClasses.delete(tailwindClass);
      const combinedClass = [...tailwindClasses].join(" ");
      onChange(combinedClass);
    },
    [onChange, value]
  );

  const pillContainerClass = classNames(
    "flex flex-wrap items-center border border-gray-300 focus:border-indigo-500 rounded-lg pt-2 pb-1 pl-2 pr-2 w-full",
    {
      "opacity-50": !!disabled || !availableClasses,
    }
  );

  if (availableClasses === undefined) {
    return (
      <div className={pillContainerClass}>No custom tailwind config found.</div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className={pillContainerClass}>
        {splitValue(value).map((tailwindClass) => {
          return (
            <TailwindClassPill
              key={tailwindClass}
              removeTailwindClass={removeTailwindClass}
              tailwindClass={tailwindClass}
            />
          );
        })}
        {hasAvailableClasses && (
          <EmbedIcon
            className="mb-1 ml-auto hover:opacity-75"
            role="button"
            aria-label="Toggle tailwind class picker"
            onClick={toggleOpen}
          />
        )}
      </div>
      {isOpen &&
        hasAvailableClasses &&
        renderDropdown(availableClasses, addTailwindClass, ref)}
    </div>
  );
}

function splitValue(value: string): string[] {
  return value.split(" ").filter((v) => v);
}

function TailwindClassPill(props: {
  tailwindClass: string;
  removeTailwindClass: (val: string) => void;
}) {
  const { tailwindClass, removeTailwindClass } = props;

  const handleClick = useCallback(() => {
    removeTailwindClass(tailwindClass);
  }, [tailwindClass, removeTailwindClass]);

  return (
    <div
      className="mr-1 mb-1 flex bg-sky-100 rounded px-1 hover:bg-sky-200 items-center whitespace-nowrap hover:cursor-pointer"
      onClick={handleClick}
    >
      {tailwindClass}
      <X className="ml-1" />
    </div>
  );
}

function renderDropdown(
  availableClasses: string[],
  addTailwindClass: (val: string) => void,
  ref: RefObject<HTMLDivElement>
) {
  return (
    <div className="relative" ref={ref}>
      <ul className="absolute w-max bg-white right-0 rounded border shadow-2xl z-10 opacity-100">
        {availableClasses.map((tailwindClass) => {
          return (
            <DropdownItem
              key={tailwindClass}
              addTailwindClass={addTailwindClass}
              tailwindClass={tailwindClass}
            />
          );
        })}
      </ul>
    </div>
  );
}

function DropdownItem(props: {
  tailwindClass: string;
  addTailwindClass: (val: string) => void;
}) {
  const { tailwindClass, addTailwindClass } = props;
  const handleClick = useCallback(() => {
    addTailwindClass(tailwindClass);
  }, [tailwindClass, addTailwindClass]);

  return (
    <li
      className="hover:bg-gray-100 px-4 py-1 cursor-pointer flex justify-between"
      onClick={handleClick}
    >
      {tailwindClass}
    </li>
  );
}

function useAvailableTailwindClasses(value: string) {
  const [customClasses, setCustomClasses] = useState<string[]>();

  useEffect(() => {
    if (customClasses) {
      return;
    }
    void customClassesPromise.then(setCustomClasses);
  }, [customClasses]);

  return customClasses?.filter(
    (tailwindClass) => !value.includes(tailwindClass)
  );
}

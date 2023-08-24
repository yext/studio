import { useCallback, useEffect, useRef, useState } from "react";
import generateTailwindSafelist from "../utils/generateTailwindSafelist";
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
      "opacity-50": !!disabled,
    }
  );

  return (
    <div className="relative" ref={ref}>
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
            className="mb-0.5"
            role="button"
            aria-label="Toggle tailwind class picker"
            onClick={toggleOpen}
          />
        )}
      </div>
      {isOpen &&
        hasAvailableClasses &&
        renderDropdown(availableClasses, addTailwindClass)}
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
  addTailwindClass: (val: string) => void
) {
  return (
    <ul className="absolute w-max bg-white mt-2 rounded border shadow-2xl z-10 opacity-100">
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
  const [availableClasses, setAvailableClasses] = useState<
    string[] | undefined
  >();

  useEffect(() => {
    if (availableClasses) {
      return;
    }
    const updateAvailableClasses = async () => {
      const customClasses = await customClassesPromise;
      const availableClasses = customClasses?.filter(
        (tailwindClass) => !value.includes(tailwindClass)
      );
      setAvailableClasses(availableClasses);
    };
    void updateAvailableClasses();
  }, [availableClasses, value]);

  return availableClasses;
}

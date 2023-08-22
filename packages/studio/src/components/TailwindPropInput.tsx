import { useCallback, useEffect, useRef, useState } from 'react';
import generateTailwindSafelist from '../utils/generateTailwindSafelist'
import { StudioTailwindTheme } from '@yext/studio-plugin';
import { ReactComponent as EmbedIcon } from "../icons/embed.svg";
import { useRootClose } from '@restart/ui';
import classNames from "classnames";

const safelistPromise: Promise<string[] | undefined> = import('@pathToUserProjectRoot/tailwind.config').then(module => {
  const theme: StudioTailwindTheme | undefined = module.default?.theme?.extend;
  return theme && generateTailwindSafelist(theme)
});

interface Props {
  onChange: (value: string) => void,
  value: string,
  disabled: boolean
}


export default function TailwindPropInput({ onChange, value, disabled }: Props) {
  const safelist = useAwaitedSafelist(value);
  const ref = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && !safelist?.length) {
      setIsOpen(false);
    }
  }, [isOpen, safelist?.length])

  useRootClose(ref, () => {
    setIsOpen(false)
  })

  const toggleOpen = useCallback(() => setIsOpen(!isOpen), [isOpen])
  const addTailwindClass = useCallback((tailwindClass: string) => {
    setIsOpen(false);
    const tailwindClasses = new Set(value.trim().split(" "))
    tailwindClasses.add(tailwindClass)
    const combinedClass = [...tailwindClasses].join(" ");
    onChange(combinedClass);
  }, [onChange, value])

  const hasUnusedClasses = !!safelist?.length
  const valueClassname = classNames("border border-gray-300 focus:border-indigo-500 rounded-lg pt-2 pb-1 pl-2 w-full", {
    "pr-8": hasUnusedClasses
  })

  return (
    <div className='relative' ref={ref}>
      <div className={valueClassname}>
        {value.trim().split(' ').map(tailwindClass => {
          return (
            <span className='mr-1 mb-1 inline-block bg-sky-100 rounded px-1 hover:bg-sky-200'>{tailwindClass}</span>
          )
        })}
      </div>
      {hasUnusedClasses && 
        <i className="absolute right-0 top-2.5 mr-2 bg-white not-italic">
          <EmbedIcon
            role="button"
            aria-label="Toggle field picker"
            onClick={toggleOpen}
          />
        </i>
      }
      {isOpen && hasUnusedClasses && renderDropdown(safelist, value, addTailwindClass)}
    </div>
  )
}

function renderDropdown(safelist: string[], value: string, addTailwindClass: (val: string) => void) {
  return (
    <ul
      className="absolute w-max bg-white mt-2 rounded border shadow-2xl z-10"
    >
      {safelist.map((tailwindClass) => {
        if (value.includes(tailwindClass)) {
          return null;
        }

        return (
          <li
            className="hover:bg-gray-100 px-4 py-1 cursor-pointer flex justify-between"
            key={tailwindClass}
            onClick={() => {
            }}
          >
            {tailwindClass}
          </li>
        )
      })}
    </ul>
  )
}


function useAwaitedSafelist(value: string) {
  const [safelist, setSafelist] = useState<string[] | undefined>()

  useEffect(() => {
    if (safelist) {
      return;
    }
    const updateSafelist = async () => {
      setSafelist(await safelistPromise)
    }
    void updateSafelist();
  }, [safelist])

  const filteredSafelist = safelist?.filter(tailwindClass => !value.includes(tailwindClass))
  return filteredSafelist;
}
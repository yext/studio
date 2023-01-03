import { FunctionComponent, PropsWithChildren, useState } from 'react';
import { ReactComponent as AddIcon } from "../icons/addcomponent.svg";
import { ReactComponent as Hexagon } from "../icons/hexagon.svg";
import { ReactComponent as Box } from "../icons/box.svg";
import { ReactComponent as Container } from "../icons/container.svg";

export default function AddComponentButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block ml-5">
      <div>
        <button
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          <AddIcon />
        </button>
      </div>
      {isOpen && <Options/>}
    </div>
  )
}

function Options() {
  return (
    <div className="absolute mt-2 z-10 rounded bg-white text-sm text-gray-700 shadow-lg">
      <div className="flex px-4 pt-2 border-b">
        <Category icon={<Box />} text='Components' />
        <Category icon={<Container />} text='Containers' />
        <Category icon={<Hexagon />} text='Modules' />
      </div>
      <div className="py-1">
        <a className="block px-4 py-2">Account settings</a>
        <a className="block px-4 py-2">Support</a>
        <a className="block px-4 py-2">License</a>
      </div>
    </div>
  )
}

function Category(props: {
  icon: JSX.Element,
  text: string
}) {
  return (
    <div className="px-2 py-0.5 m-2 flex items-center">
      <span className="mr-2 pt-0.5">{props.icon}</span>
      <span>{props.text}</span>
    </div>
  )
}
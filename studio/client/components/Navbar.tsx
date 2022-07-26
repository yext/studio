import { Link } from 'react-router-dom'

export function Navbar() {
  return (
    <nav className="bg-gray-800 flex flex-row">
      <Link className='bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium" hover:underline p-2' to='/studio/client/'>Page Editor</Link>
      <div className='text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium'></div>
      <Link className='bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium" hover:underline p-2' to='/studio/client/sitesettings'>Site Settings</Link>
    </nav>
  )
}


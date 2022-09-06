import { useState } from 'react'
import { PageEditor } from './PageEditor'
import SiteSettings from './SiteSettings'

enum Tab {
  PageEditor = 'Page Editor',
  SiteSettings = 'Site Settings'
}

export default function RightSidebar(): JSX.Element {
  const [currentTab, setTab] = useState(Tab.PageEditor)

  return (
    <div className='w-2/5 flex-grow bg-slate-500'>
      <nav className='bg-gray-800 flex flex-row'>
        <button onClick={() => { setTab(Tab.PageEditor) }} className='bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium" hover:underline p-2'>Page Editor</button>
        <div className='text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium'></div>
        <button onClick={() => { setTab(Tab.SiteSettings) }} className='bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium" hover:underline p-2'>Site Settings</button>
      </nav>
      {renderTab(currentTab)}
    </div>
  )
}

function renderTab(tab: Tab) {
  if (tab === Tab.PageEditor) {
    return <PageEditor />
  } else if (tab === Tab.SiteSettings) {
    return <SiteSettings />
  }

  return null
}
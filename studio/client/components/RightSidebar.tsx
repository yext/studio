import { useState } from 'react'
import { PageEditor } from './PageEditor'
import SiteSettings from './SiteSettings'

enum Tab {
  PageEditor = 'Page Editor',
  SiteSettings = 'Site Settings'
}

export default function RightSidebar(): JSX.Element {
  const [currentTab, setTab] = useState(Tab.PageEditor)
  const tabClassName = 'bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium" hover:underline p-2'

  return (
    <div className='w-2/5 flex-grow bg-slate-500'>
      <nav className='bg-gray-800 flex flex-row'>
        <button onClick={() => setTab(Tab.PageEditor)} className={tabClassName}>Page Editor</button>
        <div className='text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium'></div>
        <button onClick={() => setTab(Tab.SiteSettings)} className={tabClassName}>Site Settings</button>
      </nav>
      {renderTab(currentTab)}
    </div>
  )
}

function renderTab(tab: Tab) {
  switch (tab) {
    case Tab.PageEditor:
      return <PageEditor />
    case Tab.SiteSettings:
      return <SiteSettings />
  }
}
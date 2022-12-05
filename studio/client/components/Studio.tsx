import React, { useState, useEffect } from 'react'
import { SiteSettingsProps } from './SiteSettings'
import { PageState, ModuleNameToComponentMetadata, ComponentState, StandardComponentMetaData, PropShape, PropState, ComponentMetadata, ModuleMetadata } from '../../shared/models'
import { StudioContext, StudioContextType } from './useStudioContext'
import RightSidebar from './RightSidebar'
import PagePreview from './PagePreview'
import LeftSidebar from './LeftSidebar'
import { cloneDeep } from 'lodash'
import { MessageID } from '../../shared/messages'
// import { atom, useAtom } from 'jotai'
import create, { StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'
import produce from 'immer'
import { PropTypes } from '../../types'
import { getComponentState } from './getComponentState'
import { withLenses, lens } from '@dhmk/zustand-lens'

// const textAtom = atom('hello')

interface TextState {
  text: string,
  updateText: (input: string) => void
}

// const useTextStore = create<TextState>((set, get, store) => ({
//   text: 'test me',
//   updateText: (input) => set({ text: input }),
// }))

const useTextStore = create<TextState>()(
  devtools(
    (set) => ({
      text: 'test me',
      updateText: (input) => set({ text: input }, false, 'updateText'),
    }),
    { serialize: { options: true } }
  )
)

interface SiteSettingsMetadata {
  importIdentifier: string,
  propShape: PropShape
}

interface SiteSettingsSlice {
  metadata?: SiteSettingsMetadata,
  state?: PropState,
  setMetadata: (metadata: SiteSettingsMetadata) => void,
  setState: (state: PropState) => void
}

export const createSiteSettingsSlice: StateCreator<SiteSettingsSlice> = (set) => ({
  metadata: undefined,
  state: undefined,
  setMetadata: (metadata) => set({ metadata }),
  setState: (state) => set({ state }),
})

interface ModulesSlice {
  moduleNameToMetadata: ModuleNameToComponentMetadata,
  setModules: (moduleNameToMetadata: ModuleNameToComponentMetadata) => void,

  setModule: (moduleName: string, moduleMetadata: ModuleMetadata) => void,
  getModule: (moduleName: string) => ModuleMetadata

  setComponent: (moduleName: string, componentName: string, componentMetadata: ComponentMetadata) => void,
  getComponent: (moduleName: string, name: string) => ComponentMetadata,
}

export const createModulesSlice: StateCreator<ModulesSlice> = (set, get) => ({
  moduleNameToMetadata: {
    localComponents: {
      components: {}
    },
    localLayouts: {
      components: {}
    },
    builtIn: {
      components: {}
    }
  },
  setModules: (moduleNameToMetadata: ModuleNameToComponentMetadata) => set({ moduleNameToMetadata }),

  setModule: (moduleName: string, moduleMetadata: ModuleMetadata) => {
    set(produce<ModulesSlice>((state) => {
      state.moduleNameToMetadata[moduleName] = moduleMetadata
    }))
  },
  getModule: (moduleName: string) => get().moduleNameToMetadata[moduleName],

  setComponent: (moduleName: string, componentName: string, componentMetadata: ComponentMetadata) => {
    set(produce<ModulesSlice>((state) => {
      state.moduleNameToMetadata[moduleName].components[componentName] = componentMetadata
    }))
  },
  getComponent: (moduleName: string, componentName: string) => {
    return get().moduleNameToMetadata[moduleName].components[componentName]
  },
})

interface PagesSlice {
  pages: Record<string, PageState>,
  activePageName: string,
  activeComponentUUID?: string,

  setPages: (state: Record<string, PageState>) => void,

  setActivePage: (activePageName: string) => void,
  setActivePageState: (pageState: PageState) => void,
  getActivePageState: () => PageState,

  setActiveComponentUUID: (activeComponentUUID: string | undefined) => void,
  setActiveComponentProps: (props: PropState) => void,
  getActiveComponent: () => ComponentState | undefined
}

export const createPagesSlice: StateCreator<PagesSlice> = (set, get) => ({
  pages: {
    index: {
      layoutState: {
        name: 'Layout',
        props: {},
        uuid: '',
        moduleName: 'localLayouts',
      },
      componentsState: []
    },
  },
  activePageName: 'index',
  activeComponentUUID: undefined,

  setPages: (pages: Record<string, PageState>) => set({ pages }),

  setActivePage: (activePageName: string) => {
    set({ activePageName })
  },
  setActivePageState: (pageState) => set(produce<PagesSlice>(state => {
    const activePageName = state.activePageName
    if (activePageName) {
      state.pages[activePageName] = pageState
    }
  })),
  getActivePageState: () => {
    const activePage = get().pages[get().activePageName]
    return activePage
  },

  setActiveComponentUUID: (activeComponentUUID: string | undefined) => set({ activeComponentUUID }),
  getActiveComponent: () => {
    const activeComponentUUID = get().activeComponentUUID || ''
    return get().getActivePageState().componentsState.find(c => c.uuid === activeComponentUUID)
  },
  setActiveComponentProps: (props: PropState) => set(produce<PagesSlice>(state => {
    const activeComponent = get().getActiveComponent()
    if (activeComponent) {
      const components = state.pages[state.activePageName].componentsState
      components.forEach(c => {
        if (c.uuid === activeComponent.uuid) {
          c.props = props
        }
      })
    }
  })),
})

interface StudioStore {
  siteSettings: SiteSettingsSlice,
  pages: PagesSlice,
  modules: ModulesSlice
}

export const useStudioStore = create<StudioStore>()(withLenses(() => ({
  modules: lens(createModulesSlice),
  siteSettings: lens(createSiteSettingsSlice),
  pages: lens(createPagesSlice)
})))

export interface StudioProps {
  siteSettings: SiteSettingsProps,
  moduleNameToComponentMetadata: ModuleNameToComponentMetadata,
  // only supports a page named "index" for now
  componentsOnPage: {
    index: PageState
  }
}

// if (import.meta.hot) {
//   import.meta.hot.on(MessageID.TEST, (payload) => {
//     if (import.meta.hot && !import.meta.hot.data.foo) {
//       import.meta.hot.data.foo = 'bar'
//     }
//     console.log('import.meta.hot.data', import.meta.hot?.data)
//     console.log('here!', payload)
//   })
// }

// console.log('reload file?')
// import.meta.hot?.send(MessageID.TEST, {
//   // msg: textAtom.read((a) => a)
//   msg: useTextStore.setState({ text: 'weeeee!' })
// })

export default function Studio(props: StudioProps) {
  const { componentsOnPage, moduleNameToComponentMetadata, siteSettings } = props
  // const [pageState, setPageState] = useState(componentsOnPage.index)
  const [streamDocument, setStreamDocument] = useState({})

  const setMetadata = useStudioStore(state => state.siteSettings.setMetadata)
  const setState = useStudioStore(state => state.siteSettings.setState)
  const setPages = useStudioStore(state => state.pages.setPages)
  const setActivePage = useStudioStore(state => state.pages.setActivePage)
  const setModules = useStudioStore(s => s.modules.setModules)

  const a = useStudioStore(s => s.modules.moduleNameToMetadata)
  console.log('original', moduleNameToComponentMetadata['localComponents'])
  console.log('a', moduleNameToComponentMetadata['localComponents'])

  useEffect(() => {
    setMetadata({
      importIdentifier: siteSettings.componentMetadata.importIdentifier,
      propShape: siteSettings.componentMetadata.propShape ?? {},
    })
    setState(siteSettings.propState)
    setPages({
      index: componentsOnPage.index
    })
    setActivePage('index')
    setModules(moduleNameToComponentMetadata)
  }, [
    componentsOnPage.index,
    setMetadata,
    setPages,
    setState,
    setActivePage,
    setModules,
    moduleNameToComponentMetadata,
    siteSettings.componentMetadata.importIdentifier,
    siteSettings.componentMetadata.propShape,
    siteSettings.propState
  ])

  const state = useStudioStore(state => state.siteSettings.state)
  const [pageStateOnFile, setPageStateOnFile] = useState<PageState>(cloneDeep(componentsOnPage.index))

  // const [text, setText] = useAtom(textAtom)
  const { text, updateText } = useTextStore(state => state)

  const value: StudioContextType = {
    streamDocument,
    setStreamDocument,
    pageStateOnFile,
    setPageStateOnFile
  }

  return (
    <StudioContext.Provider value={value}>
      <input className='border-black border-2' type="text" value={text} onChange={(e) => updateText(e.target.value)} />
      <p>{JSON.stringify(state)}</p>
      <div className='flex h-screen'>
        <LeftSidebar />
        <PagePreview />
        <RightSidebar />
      </div>
    </StudioContext.Provider>
  )
}

import { useEffect, useState } from 'react'
import { useStudioContext } from './useStudioContext'

const streamDocumentPromises = import.meta.glob<Record<string, unknown>>([
  '../../../localData/*.json',
  '!../../../localData/mapping.json'
])
const streamDocumentMapping = import('../../../localData/mapping.json')
const pathToLocalData = '../../../localData/'

export default function StreamDocPicker() {
  const currentPage = 'index'
  const { setStreamDocument } = useStudioContext()
  const [streamDocNames, setStreamDocNames] = useState({})
  const [docName, setDocName] = useState('')

  useEffect(() => {
    streamDocumentMapping.then(m => setStreamDocNames(m.default))
  }, [])

  useEffect(() => {
    if (!docName) {
      return
    }
    const pathToDoc = pathToLocalData + docName
    if (!(pathToDoc in streamDocumentPromises)) {
      console.error('Could not find stream document promise for doc', pathToDoc, streamDocumentPromises)
      return
    }
    streamDocumentPromises[pathToDoc]().then((m: Record<string, any>) => {
      setStreamDocument(m.default ?? {})
    })
  }, [docName, setStreamDocument])

  return (
    <select
      className='select'
      onChange={e => setDocName(e.target.value)}
      value={docName}
    >
      {streamDocNames[currentPage]?.map(name => {
        return <option key={name}>{name}</option>
      })}
    </select>
  )
}
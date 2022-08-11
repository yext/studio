import { useEffect, useState } from 'react'
// @ts-ignore
// mapping.json only exists after `yext pages generate-test-data` is run
import streamDocumentMapping from '../../../localData/mapping.json'
import { useStudioContext } from './useStudioContext'

const streamDocumentPromises = import.meta.glob<Record<string, unknown>>('../../../localData/*.json')
const pathToLocalData = '../../../localData/'

export default function StreamDocPicker() {
  const currentPage = 'index'
  const { setStreamDocument } = useStudioContext()
  const streamDocumentNames = streamDocumentMapping[currentPage]
  const [docName, setDocName] = useState(streamDocumentNames[0])

  useEffect(() => {
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
      {streamDocumentNames.map(name => {
        return <option key={name}>{name}</option>
      })}
    </select>
  )
}
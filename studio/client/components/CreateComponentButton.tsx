import { Modal } from '@restart/ui'
import { useState } from 'react'
import { toast } from 'react-toastify'

export default function CreateComponentButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className='btn' onClick={() => {
        setOpen(true)
      }}>
        Create Component
      </button>
      <Modal
        show={open}
        onHide={() => setOpen(false)}
        renderBackdrop={(props) => (
          <div
            {...props}
            className="fixed inset-0 bg-black/30 z-[300]"
          />
        )}
        className="fixed z-[301] top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-white shadow-lg p-5"
      >
        <ModalContent/>
      </Modal>
    </>
  )
}

function ModalContent() {
  const [isGlobal, setIsGlobal] = useState(false)
  const [componentName, setComponentName] = useState('')

  function handleSubmit() {
    if (!componentName) {
      toast('Please give your component a name!')
      return
    }
    console.log('creating component', componentName, isGlobal)
  }

  return (
    <div className='flex flex-col m-10'>
      <label>
        <input type='checkbox' checked={isGlobal} onChange={e => setIsGlobal(e.target.checked)}></input>
        <span className='p-2'>global</span>
      </label>
      <label>
        component name:
        <input
          className='input input-bordered input-primary w-full max-w-xs'
          value={componentName}
          onChange={e => setComponentName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleSubmit()
            }
          }}
        />
      </label>
      <button className='btn m-4' onClick={handleSubmit}>
        Create {isGlobal && 'Global'} Component
      </button>
    </div>
  )
}
import { useState } from "react";

export interface LeftNavProps {
  children?: React.ReactChild
}

export function LeftNav(props: LeftNavProps) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');

  function createPage() {
    fetch(`http://127.0.0.1:8080/create-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pageId: id, pageName: name })
    });
  }

  return (
    <div className='h-screen w-64 bg-slate-500 flex flex-col'>
      <h1 className='text-3xl text-white'>Yext Studio</h1>
      {props.children}
      <div>
        <form id='form-1' onSubmit={e => { e.preventDefault(); createPage(); }}>
          <div className="flex flex-col">
            <label>Page Id</label>
            <input 
              className="rounded-md px-2 py-1 border border-gray-100 outline-1 outline-blue-300"
              value={id}
              onChange={e => setId(e.target.value)}
            />
            <label>Page Name</label>
            <input 
              className="rounded-md px-2 py-1 border border-gray-100 outline-1 outline-blue-300"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
        </form>
        <button 
        className="rounded-md border border-black mt-8 bg-slate-100" 
        type="submit"
        form="form-1" 
        value="Add Page">
          Add Page
        </button>
      </div>
    </div>
  );
}
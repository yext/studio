import { useState } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import SiteSettings from "./templates/SiteSettings";

export function LeftNav() {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [pageComponents, setPageComponents] = useState([]);

  function createPage() {
    fetch(`http://127.0.0.1:8080/create-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id, name: name })
    });
  }

  function onComponentAdd(componentId) {
    const newComponents = [...pageComponents, componentId];
    // setPageComponents(newComponents);
  }

  function renderComponentOptionsDropdown() {
    return (
      <DropdownButton title='Add Component' onSelect={e => onComponentAdd(e)}>
        <Dropdown.Item eventKey='banner'>Banner</Dropdown.Item>
        <Dropdown.Item eventKey='universal-experience'>Universal Search Experience</Dropdown.Item>
      </DropdownButton>
    );
  }

  function renderAddPage() {
    return (
      <div>
        <form id='form-1' onSubmit={e => { e.preventDefault(); createPage(); }}>
          <div className="flex flex-col">
            <label>Page Id</label>
            <input 
              className="rounded-md px-2 py-1 mr-2 border border-gray-100 outline-1 outline-blue-300"
              value={id}
              onChange={e => setId(e.target.value)}
            />
            <label>Page Name</label>
            <input 
              className="rounded-md px-2 py-1 mr-2 border border-gray-100 outline-1 outline-blue-300"
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
    );
  }

  return (
    <div className='h-screen w-2/5 bg-slate-500 flex flex-col'>
      <h1 className='text-3xl text-white'>Yext Studio</h1>
      {renderComponentOptionsDropdown()}
      {renderAddPage()}
      <SiteSettings/>
    </div>
  );
}
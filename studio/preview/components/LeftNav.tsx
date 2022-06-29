import { useContext, useState } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import PropEditor, { PropEditorContext } from "./PropEditor";
import SiteSettings from "./SiteSettings";

export function LeftNav() {
  const { updateActiveComponent } = useContext(PropEditorContext);
  function onComponentAdd(name) {
    updateActiveComponent(name);
  }

  function renderComponentOptionsDropdown() {
    return (
      <DropdownButton title='Add Component!' onSelect={onComponentAdd}>
        <Dropdown.Item eventKey='Banner'>Banner</Dropdown.Item>
      </DropdownButton>
    );
  }

  return (
    <div className='h-screen w-2/5 bg-slate-500 flex flex-col'>
      <h1 className='text-3xl text-white'>Yext Studio</h1>
      {renderComponentOptionsDropdown()}
      <PropEditor/>
      <SiteSettings/>
    </div>
  );
}
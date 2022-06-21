import { useState } from "react";

export function BannerConfiguration(props: { pageId: string}) {
  const [title, setTitle] = useState('');

  function handleChange(event) {
    setTitle(event.target.value);
  }

  function setStoreTitle() {
    const config = { title };
    fetch(`http://127.0.0.1:8080/update/${props.pageId}/banner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 'banner', props: { title } })
    });
  }

  return (
    <div className='pt-4 pb-4'>
      <form onSubmit={(e) => { e.preventDefault(); setStoreTitle() }} id="form2">
        <label>Banner</label>
        <div className='flex flex-col'>
          <div className='pl-4 pt-2'>
            <label>Title</label>
            <input
              className='rounded-md px-2 py-1 border border-gray-100 outline-1 outline-blue-300'
              autoComplete="off"
              value={title}
              onChange={handleChange}
              type="text"
            />
          </div>
        </div>
      </form>
      <button
        className="rounded-md border border-black mt-4 bg-slate-100"
        type="submit"
        form="form2"
        value="Apply">
        Apply
      </button>
    </div>
  );
}
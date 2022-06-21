import { useState } from "react";
import { UniversalExperienceProps } from "../../props/components/search/universal-experience";

export default function UniversalConfiguration(props: { pageId: string }) {
  const [placeHolder, setPlaceHolder] = useState('');
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    setConfig();
  }

  function setConfig() {
    const config: UniversalExperienceProps = {
      searchBar: {
        placeholderText: placeHolder
      },
      universalResults: {
        showAppliedFilters: showAppliedFilters
      }
    };

    fetch(`http://127.0.0.1:8080/update/${props.pageId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 'universal-experience', props: config })
    });
  }

  return (
    <div>
      <form onSubmit={onSubmit} id='form1'>
        <label>Universal Search Experience</label>
        <div className='flex flex-col'>
          <div className='pl-4 pt-2'>
            <label>Search Bar</label>
            <div className='pl-4 pt-2'>
              <label>Placeholder Text</label>
              <input
                className='rounded-md px-2 py-1 border border-gray-100 outline-1 outline-blue-300'
                value={placeHolder}
                onChange={e => setPlaceHolder(e.target.value)}
              />
            </div>
          </div>
          <div className='pl-4 pt-2'>
            <label>Search Results</label>
            <div className='pl-4 pt-2'>
              <label>Show Applied Filters</label>
              <input
                className='ml-2'
                type={'checkbox'}
                onChange={e => setShowAppliedFilters(e.target.checked)}
              />
            </div>
          </div>
        </div>
      </form>
      <button 
        className="rounded-md border border-black mt-8 bg-slate-100" 
        type="submit"
        form="form1" 
        value="Apply">
          Apply
        </button>
    </div>
  );
}
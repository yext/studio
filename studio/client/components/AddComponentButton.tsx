import { Dispatch, SetStateAction } from 'react';
import { PageComponentsState, TSPropShape } from '../../shared/models';

export default function AddComponentButton(props: {
  componentsToPropShapes: {
    Banner: TSPropShape
  },
  pageComponentsState: PageComponentsState,
  setPageComponentsState: Dispatch<SetStateAction<PageComponentsState>>
}) {
  const { componentsToPropShapes, pageComponentsState, setPageComponentsState } = props;

  return (
    <div className="dropdown mb-2">
      <label className="btn m-1" tabIndex={0}>Add Component</label>
      <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52" tabIndex={0}>
        {Object.keys(componentsToPropShapes).map(name => (
          <li key={name}><a onClick={() => {
            setPageComponentsState(pageComponentsState.concat([{
              name,
              props: {}
            }]))
          }}>{name}</a></li>
        ))}
      </ul>
    </div>
  )
}
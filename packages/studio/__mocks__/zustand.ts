/**
 * When running jest tests, the stores are not automatically reset before each test run.
 * To avoid the case of the state of one test can affecting another, the code below
 * is to mock zustand's store from https://docs.pmnd.rs/zustand/guides/testing#typescript-usage.
 */

import { act } from 'react-dom/test-utils'
const actualCreate = jest.requireActual('zustand')

// a variable to hold reset functions for all stores declared in the app
const storeResetFns = new Set<() => void>()

// when creating a store, we get its initial state, create a reset function and add it in the set
const create = () => (createState: unknown) => {
  const store = actualCreate(createState)
  const initialState = store.getState()
  storeResetFns.add(() => store.setState(initialState, true))
  return store
}

// Reset all stores after each test run
beforeEach(() => {
  act(() => storeResetFns.forEach((resetFn) => resetFn()))
})

export default create
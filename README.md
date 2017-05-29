# Aldux

WIP

Reducer with async queue

## Difference with Redux

- reducer can take async/await and promise
  - Aldux's `combineReducers` folds

## Concepts

- Folding async updating and dispatch only last result
- Reducer with async
- Internal action queueing

## Example

```js
/* @flow */
import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { combineReducers, createStore } from 'aldux'
import { withReducer, dispatcherFor } from 'react-aldux'

const initialState = { count: 0 }

// reducer can take async!
const counter = async (state = initialState, action) => {
  switch (action.type) {
    case 'increment-async':
      // wait 500ms
      await new Promise(resolve => setTimeout(resolve, 500))
      return { count: state.count + 1 }
    case 'increment':
      return { count: state.count + 1 }
    default:
      return state
  }
}

const reducer = combineReducers({ counter })
const initStore = () => createStore(reducer)

// UI
const IncrementButton = dispatcherFor([
  counter
])(function IncrementButton(props: {
  disabled: boolean,
  async: boolean,
  dispatch: any
}) {
  return (
    <button
      disabled={props.disabled}
      onClick={() =>
        props.dispatch({ type: props.async ? 'increment-async' : 'increment' })}
    >
      +1
    </button>
  )
})

const App = withReducer(initStore)(function App(props: any) {
  if (!props.flumpt$initialized) {
    return <span>Initializing...</span>
  } else {
    return (
      <div>
        {props.counter && <span>{props.counter.count}</span>}
        <hr />
        <IncrementButton async={true} disabled={props.flumpt$loading} />
        <IncrementButton async={false} disabled={props.flumpt$loading} />
        <IncrementButton async={false} disabled={false} />
      </div>
    )
  }
})

ReactDOM.render(<App />, document.querySelector('main'))

```

## LICENSE

MIT

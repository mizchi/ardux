/* @flow */
import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { combineReducers, createStore } from '../../packages/ardux/src'
import {
  dispatcherFor,
  Provider,
  connect
} from '../../packages/react-ardux/src'

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

const App = connect()(props => {
  return (
    <div>
      {props.counter && <span>{props.counter.count}</span>}
      <hr />
      <IncrementButton async={true} disabled={props.ardux$loading} />
      <IncrementButton async={false} disabled={props.ardux$loading} />
      <IncrementButton async={false} disabled={false} />
    </div>
  )
})
;(async () => {
  const store = await createStore(reducer)

  ReactDOM.render(
    <Provider store={store}><App /></Provider>,
    document.querySelector('main')
  )
})()

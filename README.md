# Ardux

Async + Reducer + Redux Like API

## Concepts

- Reducer with async
- Folding promises and dispatch only last state
- directivity `dispatch`

## Difference with Redux

- Reducer can take async/await and promise
- `dispatch` returns next definitive promise
- No bindActionCreators
- No Middlewares

## Example

```
$ yarn add ardux react-ardux react reacd-dom
```

```js
/* @flow */
import React from 'react'
import ReactDOM from 'react-dom'
import { combineReducers, createStore } from 'ardux'
import {
  dispatcherFor,
  Provider,
  connect
} from 'react-ardux'

// reducer can take async
const counter = async (state = { count: 0 }, action) => {
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

// update only counter reducer on this dispatch
const IncrementButton = dispatcherFor([
  counter
])(function IncrementButton(props: {
  async: boolean,
  dispatch: any
}) {
  return (
    <button
      onClick={() =>
        props.dispatch({ type: props.async ? 'increment-async' : 'increment' })}
    >
      +1
    </button>
  )
})

// Redux like connect
const mapStateToProps = root => ({count: root.counter.count})
const App = connect(mapStateToProps)(props => {
  return (
    <div>
      <span>{props.count}</span>
      <hr />
      <IncrementButton async={true} />
      <IncrementButton async={false} />
    </div>
  )
})
;(async () => {
  // createStore returns promise to build initial state
  const store = await createStore(reducer)

  ReactDOM.render(
    <Provider store={store}><App /></Provider>,
    document.querySelector('main')
  )
})()
```

## LICENSE

MIT

# Flumpt

Simple async-able reducer with React.

## Concepts

- Folding async updating and dispatch only last result
- Reducer with async
- Internal action queueing

## Example

```js
import React from 'react'
import { withReducer, dispatchable } from 'flumpt'
const initialState = { count: 0 }

// reducer: Flumpt's reducer can take async!
const reducer = async (state = initialState, action) => {
  switch (action.type) {
    case 'increment-async':
      // wait 500ms
      await new Promise(resolve => setTimeout(resolve, 500))
      return { count: state.count + 1 }
    default:
      return state
  }
}

// only provide context.dispatch()
const IncrementButton = dispatchable(
  function IncrementButton(props, context) {
    return <button
      disabled={props.disabled}
      onClick={() => context.dispatch({ type: 'increment-async' })}
    >
      +1
    </button>
  }
)

const App = withReducer(reducer)(function App(props) {
  if (!props.flumpt$initilized) {
    return <span>Initializing...</span>
  } else {
    return <div>
      <span>{props.count}</span>
      <IncremenButton disabled={props.flumpt$loading}/>
      <IncremenButton disabled={false}/>
    </div>
  }
})

ReactDOM.render(<App/>, el)
```

## LICENSE

MIT

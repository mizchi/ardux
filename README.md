# Flumpt

Conceptual Implementation of EventEmitter based Flux.

## Concepts

Flux is (... what you think) but all you need is just an `EventEmitter`.

Interface is inpired by `Om`.

## Example

### withFlux

```js
import React from 'react'
import {withFlux, dispatchable} from 'flumpt'

// hoc
const CounterIncrement = dispatchable(function CounterIncrement(props, context) {
  return <button onClick={() => context.dispatch('increment')}>+1</button>
})

@withFlux((update, on) => {
  on('increment', () => {
    update(state => {
      return {count: state.count + 1}
    })
  })
}, {count: 0})
class MyApp extends React.Component {
  render () {
    return <div>
      <span>{this.props.count}</span>
      <CounterIncrement/>
    </div>
  }
}
```

- `Flux` is `EventEmitter`
- `Component` is just `ReactComponent` with `dispatch` method.

See detail in `index.d.ts`

## Middlewares

Middleware function type is `<T>(t: T) => T | Promise<T>` or  `<T>(t: Promise<T>) => Promise<T>;`. (Use Promise.resolve if you consider promise)
`Flux#render(state)` is always promise unwrapped promise but a middelware handle raw nextState received by `Flux#update`.

## LICENSE

MIT

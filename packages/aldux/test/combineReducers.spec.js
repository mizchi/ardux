/* @flow */
import test from 'ava'
import { combineReducers as redux$combineReducers } from 'redux'
import combineReducers from '../src/combineReducers'

const initAction = { type: 'init' }

test('simple', t => {
  const combined = combineReducers({
    counter: (state = { count: 0 }, _action) => {
      return state
    }
  })
  const ret = combined(undefined, initAction)
  t.deepEqual(ret, { counter: { count: 0 } })
})

test('update', t => {
  const combined = combineReducers({
    counter: (state = { count: 0 }, action) => {
      switch (action.type) {
        case 'increment':
          return { count: state.count + 1 }
        default:
          return state
      }
    }
  })
  const first = combined(undefined, initAction)
  const second = combined(first, { type: 'increment' })
  t.deepEqual(second, { counter: { count: 1 } })
})

test('deep', t => {
  const combined = combineReducers({
    nested: {
      counter: (state = { count: 0 }, _action) => {
        return state
      }
    }
  })
  const ret = combined(undefined, initAction)
  t.deepEqual(ret, { nested: { counter: { count: 0 } } })
})

test('async', async t => {
  const combined = combineReducers({
    counter: (state = { count: 0 }, _action) => {
      return Promise.resolve(state)
    }
  })
  const ret = await combined(undefined, initAction)
  t.deepEqual(ret, { counter: { count: 0 } })
})

test('skip async by scope', async t => {
  const combined = combineReducers({
    counter: (state = { count: 0 }, _action) => {
      return Promise.resolve(state)
    }
  })
  const first = await combined(undefined, initAction)
  const second = combined(first, initAction, { scope: [] })
  t.not(second instanceof Promise)
  t.deepEqual(first, second)
})

test('combine with redux combineReducers', t => {
  const combined = combineReducers({
    counter: (state = { count: 0 }, _action) => {
      return state
    },
    b: 1,
    byRedux: redux$combineReducers({
      a: () => ({ v: 1 })
    })
  })
  const ret = combined(undefined, initAction)
  t.deepEqual(ret, {
    counter: { count: 0 },
    b: 1,
    byRedux: { a: { v: 1 } }
  })
})

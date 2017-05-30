/* @flow */
import test from 'ava'
import createStore from '../src/createStore'

const reducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case 'increment-async':
      return Promise.resolve({ count: state.count + 1 })
    case 'increment':
      return { count: state.count + 1 }
    default:
      return Promise.resolve(state)
  }
}

test('initialize', async t => {
  const store = await createStore(reducer)
  t.deepEqual(store.getState(), { count: 0 })
})

test('initialize with initialState', async t => {
  const store = await createStore(reducer, { count: 3 })
  t.deepEqual(store.getState(), { count: 3 })
})

test('dispatch sync', async t => {
  const store = await createStore(reducer)
  store.dispatch({ type: 'increment' })
  t.deepEqual(store.getState(), { count: 1 })
})

test('dispatch async', async t => {
  const store = await createStore(reducer)
  const p = store.dispatch({ type: 'increment-async' })
  t.true(p instanceof Promise)
  t.deepEqual(store.getState(), { count: 0 })
  await p
  t.deepEqual(store.getState(), { count: 1 })
})

test('fold promises', async t => {
  const store = await createStore(reducer)
  const p1 = store.dispatch({ type: 'increment-async' })
  const p2 = store.dispatch({ type: 'increment-async' })
  await Promise.all([p1, p2])
  t.deepEqual(store.getState(), { count: 2 })
})

test('fold promises / stop by inital promise', async t => {
  const store = await createStore(reducer)
  const p1 = store.dispatch({ type: 'increment-async' })
  const p2 = store.dispatch({ type: 'increment' })
  await Promise.all([p1, p2])
  t.deepEqual(store.getState(), { count: 2 })
})

test('subscribe and emit on init', async t => {
  t.plan(1)
  const store = await createStore(reducer)
  store.subscribe(state => {
    t.deepEqual(state, { count: 0 })
  })
})

test('subscribe: emit by sync', async t => {
  t.plan(2)
  const store = await createStore(reducer)
  store.subscribe(_state => {
    t.pass()
  }, false)
  await store.dispatch({ type: 'increment' })
  await store.dispatch({ type: 'increment' })
})

test('subscribe: unsubscribe', async t => {
  t.plan(1)
  const store = await createStore(reducer)
  const unsubscribe = store.subscribe(_state => {
    t.pass()
  }, false)
  await store.dispatch({ type: 'increment' })
  unsubscribe()
  await store.dispatch({ type: 'increment' })
})

test('subscribe: fold async action and emit once', async t => {
  t.plan(1)
  const store = await createStore(reducer)
  store.subscribe(_state => {
    t.pass()
  }, false)
  const p1 = store.dispatch({ type: 'increment-async' })
  const p2 = store.dispatch({ type: 'increment-async' })
  return await Promise.all([p1, p2])
})

test('subscribe: fold async / queueing by initial async', async t => {
  t.plan(1)
  const store = await createStore(reducer)
  store.subscribe(_state => {
    t.pass()
  }, false)
  const p1 = store.dispatch({ type: 'increment-async' })
  const p2 = store.dispatch({ type: 'increment' })
  return await Promise.all([p1, p2])
})

test('subscribe: forceUpdate emit subscribe even if action is in folding', async t => {
  t.plan(3)
  const store = await createStore(reducer)
  store.subscribe(_state => {
    t.pass()
  }, false)
  const p1 = store.dispatch({ type: 'increment-async' }, { forceUpdate: true })
  const p2 = store.dispatch({ type: 'increment-async' }, { forceUpdate: true })
  const p3 = store.dispatch({ type: 'increment-async' })
  return await Promise.all([p1, p2, p3])
})

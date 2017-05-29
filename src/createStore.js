/* @flow */
import Updater from './Updater'

export default async (
  reducer: Function,
  initialState?: any,
  _middlewares?: any
) => {
  let state =
    initialState ||
    (await reducer(undefined, {
      type: '@@flumpt/initialize'
    }))

  const updater = new Updater(initialState)

  return {
    on: (namespace, fn) => {
      updater.on(namespace, (...args) => {
        return fn(...args)
      })
    },
    dispose: () => {
      updater.removeAllListeners()
    },
    getState: () => state,
    dispatch: (action, meta) => {
      return updater.update(async prev => {
        state = await reducer(prev, action, meta)
        return state
      })
    }
  }
}

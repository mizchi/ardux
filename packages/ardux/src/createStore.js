/* @flow */
import defer from 'promise-defer'
import { INITIALIZE } from './actions'
import type { Meta } from './types'

export default async (
  reducer: Function,
  initialState?: any,
  enhancer?: Function
) => {
  const firstState =
    initialState ||
    (await reducer(undefined, {
      type: INITIALIZE
    }))

  let _state = firstState
  let _currentPromise = null
  let _actionQueue: {
    action: any,
    meta: ?Meta
  }[] = []

  let _updating = false
  let _listeners: Function[] = []

  // helpers
  const emit = () => {
    _listeners.forEach(f => f(_state))
  }

  const addQueue = actionAndMeta => {
    _actionQueue.push(actionAndMeta)
  }

  return {
    subscribe(fn: Function, emitOnInit: boolean = true) {
      _listeners.push(fn)
      if (emitOnInit) {
        emit()
      }

      return () => {
        const index = _listeners.findIndex(i => i === fn)
        if (index > -1) {
          _listeners.splice(index, 1)
        }
      }
    },
    dispose() {
      if (_currentPromise) {
        _currentPromise.reject('disposed')
      }
      _actionQueue = []
      _listeners = []
    },
    getState() {
      return _state
    },
    isUpdating(): boolean {
      return _updating
    },
    waitNextState(): Promise<void> {
      return _currentPromise || Promise.resolve()
    },
    dispatch: async (action, meta?: Meta) => {
      // queueing if other action is on progress
      if (_updating) {
        addQueue({ action, meta })
        return _currentPromise
      }

      // dispatch and end
      const stateOrPromise = reducer(_state, action, meta)
      if (!(stateOrPromise instanceof Promise)) {
        _state = stateOrPromise
        emit()
        return Promise.resolve(action)
      }

      // start async updating
      let _handledActions = []
      _updating = true

      const deferred = defer()
      _currentPromise = deferred.promise
      _currentPromise.then(() => emit())

      // if there is left queue after first async,
      const updateLoop = async () => {
        const next = _actionQueue.shift()
        if (!next) {
          _updating = false
          deferred.resolve({ actions: _handledActions })
          _handledActions = []
          return
        }
        _state = await reducer(_state, next.action, next.meta)
        if (meta && meta.forceUpdate) {
          emit()
        }
        _handledActions.push(next.action)
        // TODO: Emit update internal state
        return updateLoop() // recursive loop
      }

      _state = await stateOrPromise
      _handledActions.push(action)
      updateLoop()
      return _currentPromise
    }
  }
}

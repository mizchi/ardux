/* @flow */
import React from 'react'
import PropTypes from 'prop-types'
import Updater from './updater'

export function combineReducers(reducerMap: any) {
  return async (state: any = {}, action: any, meta: any) => {
    const promises = Object.keys(reducerMap).map(async (key: string) => {
      const beforeState = state[key]
      const f = reducerMap[key]

      if (!(f instanceof Function)) {
        return { key, result: f }
      }

      if (meta && meta.for) {
        // Handle dispatchFor('aaa')
        if (!(meta.for === f || meta.for === key)) {
          return { key, result: beforeState }
        }

        // Handle dispatchFor(['aaa', 'bbb'])
        if (
          meta.for.length &&
          !(meta.for.includes(f) || meta.for.includes(key))
        ) {
          return { key, result: beforeState }
        }
      }

      console.time(`async ${key}`)
      const result = await f(beforeState, action, meta)
      console.timeEnd(`async ${key}`)
      return { key, result }
    })

    const results = await Promise.all(promises)

    return results.reduce((acc: any, { key, result }) => {
      return { ...acc, [key]: result }
    }, {})
  }
}

const contextTypes = {
  dispatch: PropTypes.any,
  getState: PropTypes.any
}

export const createStore = async (
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

export function withReducer(initStore: any) {
  const loading = initStore()
  return (Wrapped: Class<React$Component<*, *, *>>) => {
    return class Flumpt$WithReducer extends React.Component {
      static childContextTypes = contextTypes
      getChildContext() {
        if (this.store) {
          return {
            dispatch: this.store.dispatch,
            getState: this.store.getState
          }
        } else {
          return {
            dispatch: () => {
              console.warn('Flumpt: not ready for dispatch')
            },
            getState: () => {
              console.warn('Flumpt: not ready for getState')
              return {}
            }
          }
        }
      }

      state: {
        flumpt$initialized: boolean,
        flumpt$loading: boolean
      }

      ready: Promise<*>
      store: any

      constructor(props: any) {
        super(props)
        this.state = {
          // ...store.getState(),
          flumpt$initialized: false,
          flumpt$loading: true
        }

        loading.then(store => {
          this.store = store
          global.store = store

          this.setState({
            ...store.getState(),
            flumpt$initialized: true,
            flumpt$loading: false
          })

          store.on(':update', state => {
            this.setState({
              ...state,
              flumpt$initialized: true,
              flumpt$loading: false
            })
          })

          store.on(':start-async-updating', () => {
            this.setState({
              flumpt$loading: true
            })
          })

          store.on(':end-async-updating', () => {
            this.setState({
              flumpt$loading: false
            })
          })
          requestAnimationFrame(() => {
            this.store.dispatch({ type: '@@flumpt/ready' })
          })
        })
      }

      componentWillUnmount() {
        this.store.dispose()
      }

      render() {
        return <Wrapped {...{ ...this.props, ...this.state }} />
      }
    }
  }
}

// Components
export function dispatcherFor(target?: any) {
  return (Wrapped: Class<React$Component<*, *, *>>) =>
    class Flumpt$Dispatcher extends React.Component {
      static contextTypes = contextTypes
      render() {
        return (
          <Wrapped
            {...{
              ...this.props,
              dispatch: (action, meta = {}) =>
                this.context.dispatch(action, { ...meta, for: target })
            }}
          />
        )
      }
    }
}

export function dispatcher(Wrapped: Class<React$Component<*, *, *>>) {
  return dispatcherFor()(Wrapped)
}

export function connect(mapper: Function) {
  return (Wrapped: Class<React$Component<*, *, *>>) =>
    class Flumpt$Connector extends React.Component {
      static contextTypes = contextTypes
      render() {
        const props = mapper(this.context.getState())
        return <Wrapped {...{ ...this.props, props }} />
      }
    }
}

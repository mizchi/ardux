/* @flow */
import React from 'react'
import contextTypes from './contextTypes'

export default function withReducer(initStore: any) {
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

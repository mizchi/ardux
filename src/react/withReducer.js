/* @flow */
import React from 'react'
import contextTypes from './contextTypes'

export default function withReducer(initStore: any) {
  const loading = initStore()
  return (Wrapped: any) => {
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

      store: any

      constructor(props: any) {
        super(props)
        this.state = {
          flumpt$initialized: false,
          flumpt$loading: true
        }

        loading.then(store => {
          this.store = store
          global.store = store

          store.subscribe(state => {
            this.setState({
              ...state,
              flumpt$initialized: true,
              flumpt$loading: false
            })
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

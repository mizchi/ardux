/* @flow */
import React from 'react'
import contextTypes from './contextTypes'

export default function withReducer(store: any) {
  return (Wrapped: any) => {
    return class Flumpt$WithReducer extends React.Component {
      static childContextTypes = contextTypes
      getChildContext() {
        return {
          dispatch: store.dispatch,
          getState: store.getState
        }
      }

      state: {
        flumpt$loading: boolean
      } = {
        flumpt$loading: true
      }

      constructor(props: any) {
        super(props)

        store.subscribe(state => {
          this.setState({
            ...state,
            flumpt$loading: false
          })
        })
      }

      componentWillUnmount() {
        store.dispose()
      }

      render() {
        return <Wrapped {...{ ...this.props, ...this.state }} />
      }
    }
  }
}

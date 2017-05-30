/* @flow */
import React from 'react'
import contextTypes from './contextTypes'

// Components
export function dispatcherFor(scope?: any) {
  return (Wrapped: any) =>
    class Ardux$Dispatcher extends React.Component {
      static contextTypes = contextTypes
      render() {
        const store = this.context.store
        return (
          <Wrapped
            {...{
              ...this.props,
              dispatch: (action, meta = {}) => {
                store.dispatch(action, { ...meta, scope })
              }
            }}
          />
        )
      }
    }
}

export function dispatcher(Wrapped: any) {
  return dispatcherFor()(Wrapped)
}

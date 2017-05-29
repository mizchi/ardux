/* @flow */
import React from 'react'
import contextTypes from './contextTypes'

// Components
export function dispatcherFor(target?: any) {
  return (Wrapped: any) =>
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

export function dispatcher(Wrapped: any) {
  return dispatcherFor()(Wrapped)
}

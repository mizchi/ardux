/* @flow */
import React from 'react'
import contextTypes from './contextTypes'

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

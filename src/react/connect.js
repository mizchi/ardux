/* @flow */
import React from 'react'
import contextTypes from './contextTypes'

export default function connect(mapper: Function) {
  return (Wrapped: Class<React$Component<*, *, *>>) =>
    class Flumpt$Connector extends React.Component {
      static contextTypes = contextTypes
      render() {
        const props = mapper(this.context.getState())
        return <Wrapped {...{ ...this.props, props }} />
      }
    }
}

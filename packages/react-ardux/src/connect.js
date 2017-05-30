/* @flow */
import React from 'react'
import contextTypes from './contextTypes'

const id = x => x

export default function connect(mapper: Function = id) {
  return (Wrapped: Class<React$Component<*, *, *>>) =>
    class Ardux$Connector extends React.Component {
      static contextTypes = contextTypes
      constructor(...args: any) {
        super(...args)
        this.state = mapper(this.context.store.getState())
      }

      unsubscribe: ?Function
      componentWillMount() {
        this.unsubscribe = this.context.store.subscribe(state => {
          const props = mapper(state)
          this.setState(props)
        })
      }

      componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe()
      }

      render() {
        return (
          <Wrapped
            {...{
              ...this.props,
              ...this.state,
              dispatch: this.context.store.dispatch
            }}
          />
        )
      }
    }
}

/* @flow */
import React from 'react'
import PropTypes from 'prop-types'
import PromisedReducer from 'promised-reducer'

const SharedTypes = {
  dispatch: PropTypes.any,
  rootProps: PropTypes.any
}

export class Provider extends React.Component {
  static childContextTypes: any = SharedTypes

  props: any

  getChildContext() {
    return {
      dispatch: this.props.emitter.emit.bind(this.props.emitter),
      rootProps: this.props
    }
  }
  render() {
    return this.props.children
  }
}

export function withFlux(subscriber: Function, initialState: any = {}) {
  const pr = new PromisedReducer(initialState)
  return (Wrapped: Class<React$Component<*, *, *>>) =>
    class Flumpt$WithFlux extends React.Component {
      static childContextTypes: any = SharedTypes

      getChildContext() {
        const rootProps = Object.assign({}, this.props, this.state)
        return {
          dispatch: pr.emit.bind(pr),
          rootProps
        }
      }

      constructor(props: any) {
        super(props)
        this.state = initialState
        subscriber(pr.update.bind(pr), pr.on.bind(pr))
        pr.on(':update', () => {
          this.setState(pr.state)
        })
      }

      componentWillUnmount() {
        pr.removeAllListeners()
      }

      render() {
        return <Wrapped {...Object.assign({}, this.props, this.state)} />
      }
    }
}

export function dispatchable(Wrapped: Class<React$Component<*, *, *>>) {
  Wrapped.contextTypes = SharedTypes
  return Wrapped
}

// @deprecated

export class Flux extends PromisedReducer {
  constructor({ renderer, initialState, middlewares }: any) {
    super(initialState, middlewares)
    this._renderer = createRenderer({ emitter: this, render: renderer })
    this._renderedElement = null

    this.on(':update', () => {
      this._renderedElement = this._renderer(this.render(this.state))
    })
    this.subscribe()
  }

  _setState(...args: any) {
    if (this._renderedElement) {
      this._renderedElement.setState(...args)
    }
  }

  subscribe() {
    // override me
  }
}

export function createRenderer({ emitter, render }: any) {
  console.warn('Flumpt.createRenderer is deprecated. Use withFlux')
  return (el: any) => {
    return render(<Provider emitter={emitter}>{el}</Provider>)
  }
}

export class Component extends React.Component {
  static contextTypes = SharedTypes

  dispatch(...args: any) {
    return this.context.dispatch(...args)
  }
}

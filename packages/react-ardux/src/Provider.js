/* @flow */
import React from 'react'
import contextTypes from './contextTypes'

export default class Provider extends React.Component {
  static childContextTypes = contextTypes
  props: { store: any, children: any }
  getChildContext() {
    return {
      store: this.props.store
    }
  }
  render() {
    return this.props.children
  }
}

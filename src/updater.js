/* @flow */
import EventEmitter from 'events'

const applyMiddlewares = (middlewares, nextState) => {
  return middlewares.reduce((s, next) => {
    return next(s)
  }, nextState)
}

export default class Updater extends EventEmitter {
  state: any
  middlewares: any
  updating: boolean
  _updatingQueue: Array<*>
  _updatingPromise: ?Promise<*>
  constructor(initialState: any, middlewares: any = []) {
    super()
    this.state = initialState ? initialState : {}
    this.middlewares = middlewares ? middlewares : []

    this.updating = false
    this._updatingQueue = [] // TODO
    this._updatingPromise = null
  }

  _finishUp(nextState: any) {
    const inAsync = !!this._updatingPromise

    if (inAsync) {
      this._updatingQueue.length = 0
      this._updatingPromise = null
      this.updating = false
    }

    this.state = nextState
    this.emit(':update', this.state)
    console.log(':update', this.state)

    if (inAsync) {
      this.emit(':end-async-updating')
      // console.log(':end-async-updating')
    }
    return Promise.resolve()
  }

  update(nextStateFn: Function) {
    // if app is updating, add fn to queues and return current promise;
    if (this.updating) {
      this._updatingQueue.push(nextStateFn)
      return this._updatingPromise
    }

    // Create state
    const promiseOrState = applyMiddlewares(
      this.middlewares,
      nextStateFn(this.state)
    )

    // if state is not promise, exec and resolve at once.
    if (!(promiseOrState instanceof Promise)) {
      const oldState = this.state
      this._finishUp(promiseOrState)
      this.emit(':process-updating', this.state, oldState)
      // console.log('process-updating')
      return Promise.resolve()
    }

    // start async updating!
    this.updating = true
    this.emit(':start-async-updating')
    // console.log('start-async-updating')

    // create callback to response.
    // TODO: I want Promise.defer
    var endUpdate
    this._updatingPromise = new Promise(done => {
      endUpdate = done
    })

    // drain first async
    const lastState = this.state
    promiseOrState.then(nextState => {
      this.emit(':process-async-updating', nextState, lastState)
      // console.log('process-async-updating')

      // if there is left queue after first async,
      const updateLoop = appliedState => {
        const nextFn = this._updatingQueue.shift()
        if (nextFn == null) {
          this._finishUp(appliedState)
          endUpdate()
          return
        } else {
          return Promise.resolve(
            applyMiddlewares(this.middlewares, nextFn(appliedState))
          ).then(s => {
            this.emit(
              ':process-async-updating',
              s,
              appliedState,
              this._updatingQueue.length
            )
            this.emit(':process-updating', s, appliedState)
            updateLoop(s) // recursive loop
          })
        }
      }
      updateLoop(nextState)
    })

    return this._updatingPromise
  }
}

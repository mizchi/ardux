/* @flow */
export default function combineReducers(reducerMap: any) {
  return async (state: any = {}, action: any, meta: any) => {
    const promises = Object.keys(reducerMap).map(async (key: string) => {
      const beforeState = state[key]
      const f = reducerMap[key]

      if (!(f instanceof Function)) {
        return { key, result: f }
      }

      if (meta && meta.for) {
        // Handle dispatchFor('aaa')
        if (!(meta.for === f || meta.for === key)) {
          return { key, result: beforeState }
        }

        // Handle dispatchFor(['aaa', 'bbb'])
        if (
          meta.for.length &&
          !(meta.for.includes(f) || meta.for.includes(key))
        ) {
          return { key, result: beforeState }
        }
      }

      console.time(`async ${key}`)
      const result = await f(beforeState, action, meta)
      console.timeEnd(`async ${key}`)
      return { key, result }
    })

    const results = await Promise.all(promises)

    return results.reduce((acc: any, { key, result }) => {
      return { ...acc, [key]: result }
    }, {})
  }
}

/* @flow */
export default function combineReducers(reducerMap: any) {
  return async (state: any = {}, action: any, meta: any) => {
    const promises = Object.keys(reducerMap).map(async (key: string) => {
      const beforeState = state[key]
      const child = reducerMap[key]

      if (!(child instanceof Function)) {
        return { key, result: child }
      }

      if (meta && meta.for) {
        // Handle dispatchFor('aaa')
        if (!(meta.for === child || meta.for === key)) {
          return { key, result: beforeState }
        }

        // Handle dispatchFor(['aaa', 'bbb'])
        if (
          meta.for.length &&
          !(meta.for.includes(child) || meta.for.includes(key))
        ) {
          return { key, result: beforeState }
        }
      }

      console.time(`async ${key}`)
      const result = await child(beforeState, action, meta)
      console.timeEnd(`async ${key}`)
      return { key, result }
    })

    const results = await Promise.all(promises)

    return results.reduce((acc: any, { key, result }) => {
      return { ...acc, [key]: result }
    }, {})
  }
}

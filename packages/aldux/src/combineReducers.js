/* @flow */
import flatten from 'flatten'
import immutable from 'object-path-immutable'
import objectPath from 'object-path'
import type { Meta } from './types'

type FlatReducers = { val: any, path: string[] }[]

export function flattenReducers(
  map: { [key: string]: any },
  path: string[] = []
): FlatReducers {
  return flatten(
    Object.keys(map).map(key => {
      const val = map[key]
      if (!(val instanceof Function) && val instanceof Object) {
        return flattenReducers(val, path.concat([key]))
      } else {
        return { val, path: path.concat([key]) }
      }
    })
  )
}

export function exec(
  list: FlatReducers,
  state: any,
  action: any,
  meta: ?Meta
): FlatReducers {
  return list.map(({ path, val }) => {
    if (val instanceof Function) {
      if (meta && meta.scope && meta.scope instanceof Array) {
        if (!meta.scope.includes(val)) {
          const lastVal = objectPath.get(state, path)
          return { path, val: lastVal }
        }
      }
      const cur = objectPath.get(state, path)
      return { path, val: val(cur, action, meta) }
    }
    return { path, val }
  })
}

async function resolveAsyncParallel(listOnExec: FlatReducers): Promise<Object> {
  const results = await Promise.all(listOnExec.map(i => i.val))
  return foldState(
    results.map((ret, index) => {
      return { path: listOnExec[index].path, val: ret }
    })
  )
}

async function resolveAsyncSerial(listOnExec: FlatReducers): Promise<Object> {
  const results: any = []
  for (const i of listOnExec) {
    const ret = await i.val
    results.push({ path: i.path, val: ret })
  }
  return foldState(results)
}

function includePromise(list: FlatReducers): boolean {
  return list.some(i => i.val instanceof Promise)
}

function foldState(list: FlatReducers): Object {
  return list.reduce((acc, { path, val }) => {
    return immutable.set(acc, path, val)
  }, {})
}

export default function combineReducers(reducerMap: {
  [key: string]: any
}): (any, any, any) => Promise<Object> {
  const list = flattenReducers(reducerMap)
  return (s: any = {}, a: any, meta: ?Meta) => {
    const listOnExec = exec(list, s, a, meta)
    if (includePromise(listOnExec)) {
      if (meta && !meta.parallel) {
        return resolveAsyncSerial(listOnExec)
      } else {
        return resolveAsyncParallel(listOnExec)
      }
    } else {
      return foldState(listOnExec)
    }
  }
}

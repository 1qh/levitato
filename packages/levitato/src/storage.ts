interface Pos {
  x: number
  y: number
}
interface StorageAdapter {
  get: (key: string) => null | Pos
  set: (key: string, pos: Pos) => void
}
const localStorageAdapter: StorageAdapter = {
  get: key => {
    try {
      const raw = globalThis.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as Pos) : null
    } catch {
      return null
    }
  },
  set: (key, pos) => {
    try {
      globalThis.localStorage.setItem(key, JSON.stringify(pos))
    } catch {
      /* noop */
    }
  }
}
export { localStorageAdapter }
export type { Pos, StorageAdapter }

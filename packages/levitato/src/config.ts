type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}
interface LevitatoConfig {
  bubbleSize: number
  dismiss: {
    durationMs: number
    magnet: number
    radius: number
  }
  dragThresholdPx: number
  edgeMargin: number
  popover: {
    gap: number
    maxHeightPx: number
    width: number
  }
  springs: {
    popover: SpringConfig
    snap: SpringConfig
    suction: SpringConfig
  }
}
interface SpringConfig {
  damping: number
  mass: number
  stiffness: number
}
const defaultConfig: LevitatoConfig = {
  bubbleSize: 40,
  dismiss: {
    durationMs: 260,
    magnet: 0.35,
    radius: 80
  },
  dragThresholdPx: 5,
  edgeMargin: 12,
  popover: {
    gap: 10,
    maxHeightPx: 480,
    width: 288
  },
  springs: {
    popover: { damping: 28, mass: 0.7, stiffness: 380 },
    snap: { damping: 28, mass: 0.8, stiffness: 320 },
    suction: { damping: 18, mass: 0.6, stiffness: 520 }
  }
}
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const mergeInto = <T>(base: T, override: DeepPartial<T> | undefined): T => {
  if (override === undefined) return base
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const key of Object.keys(override) as (keyof T)[]) {
    const ov = (override as Record<string, unknown>)[key as string]
    const bv = (base as Record<string, unknown>)[key as string]
    if (ov !== undefined)
      out[key as string] = isObject(ov) && isObject(bv) ? mergeInto(bv, ov as DeepPartial<typeof bv>) : ov
  }
  return out as T
}
const mergeConfig = (override?: DeepPartial<LevitatoConfig>): LevitatoConfig => mergeInto(defaultConfig, override)
const toSpring = (s: SpringConfig) => ({ ...s, type: 'spring' as const })
export type { DeepPartial, LevitatoConfig, SpringConfig }
export { defaultConfig, mergeConfig, toSpring }

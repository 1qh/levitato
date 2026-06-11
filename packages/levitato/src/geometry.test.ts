import { describe, expect, test } from 'bun:test'
import { clampY, restingX, scaleYByViewport } from './geometry'

const setViewport = (width: number, height: number) => {
  Object.defineProperty(globalThis, 'innerHeight', { configurable: true, value: height })
  Object.defineProperty(globalThis, 'innerWidth', { configurable: true, value: width })
}
describe('geometry', () => {
  test('restingX docks to the requested edge', () => {
    setViewport(1280, 720)
    expect(restingX('left', 40, 12)).toBe(12)
    expect(restingX('right', 40, 12)).toBe(1228)
  })
  test('scaleYByViewport preserves center ratio across viewport changes', () => {
    setViewport(960, 900)
    expect(scaleYByViewport({ margin: 12, previousHeight: 720, size: 40, value: 340 })).toBe(430)
  })
  test('clampY keeps the bubble inside vertical margins', () => {
    setViewport(960, 900)
    expect(clampY(-100, 40, 12)).toBe(12)
    expect(clampY(1000, 40, 12)).toBe(848)
  })
})

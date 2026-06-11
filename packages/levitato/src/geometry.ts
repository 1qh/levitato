const restingX = (dock: 'left' | 'right', size: number, margin: number) =>
  dock === 'right' ? globalThis.innerWidth - size - margin : margin
const clampY = (value: number, size: number, margin: number) => {
  const maxY = globalThis.innerHeight - size - margin
  return Math.max(margin, Math.min(maxY, value))
}
interface ScaleYByViewportOptions {
  readonly margin: number
  readonly previousHeight: number
  readonly size: number
  readonly value: number
}
const scaleYByViewport = ({ margin, previousHeight, size, value }: ScaleYByViewportOptions) => {
  const centerRatio = (value + size / 2) / previousHeight
  return clampY(centerRatio * globalThis.innerHeight - size / 2, size, margin)
}
export { clampY, restingX, scaleYByViewport }

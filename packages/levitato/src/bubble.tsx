/** biome-ignore-all lint/suspicious/noEmptyBlockStatements: intentional empty catch */
/* eslint-disable @typescript-eslint/strict-void-return, no-empty, @eslint-react/hooks-extra/no-direct-set-state-in-use-effect */
'use client'
import type { ReactNode } from 'react'
import { animate, AnimatePresence, motion, MotionConfig, useMotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { cn } from './cn'
import { matchesHotkey } from './hotkey'
import { localStorageAdapter, type StorageAdapter } from './storage'
const BUBBLE_SIZE = 40
const EDGE_MARGIN = 12
const DISMISS_RADIUS = 80
const FLICK_VELOCITY = 1800
const MAGNET_STRENGTH = 0.35
const SPRING = { damping: 28, mass: 0.8, stiffness: 320, type: 'spring' as const }
const POPOVER_SPRING = { damping: 28, mass: 0.7, stiffness: 380, type: 'spring' as const }
const vibrate = (pattern: number | number[]) => {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern)
  } catch {}
}
const computeRestingX = (dock: 'left' | 'right') =>
  dock === 'right' ? globalThis.innerWidth - BUBBLE_SIZE - EDGE_MARGIN : EDGE_MARGIN
const DefaultIcon = () => (
  <svg aria-hidden='true' fill='currentColor' height='6' viewBox='0 0 24 6' width='22'>
    <circle cx='4' cy='3' r='2' />
    <circle cx='12' cy='3' r='2' />
    <circle cx='20' cy='3' r='2' />
  </svg>
)
const CloseIcon = () => (
  <svg aria-hidden='true' className='size-3.5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
    <path d='M6 6l12 12M6 18L18 6' strokeLinecap='round' />
  </svg>
)
interface BubbleProps {
  children?: ReactNode
  className?: string
  hotkey?: false | string
  icon?: ReactNode
  onOpenChange?: (open: boolean) => void
  open?: boolean
  storage?: StorageAdapter
  storageKey?: string
  style?: React.CSSProperties
  title?: string
  trailing?: ReactNode
  visible?: boolean
}
const Bubble = ({
  children,
  className,
  hotkey = 'mod+k',
  icon,
  onOpenChange,
  open: openProp,
  storage = localStorageAdapter,
  storageKey = 'levitato:bubble',
  style: styleProp,
  title,
  trailing,
  visible = true
}: BubbleProps) => {
  const controlled = openProp !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlled ? openProp : internalOpen
  const setOpen = (next: boolean | ((p: boolean) => boolean)) => {
    const value = typeof next === 'function' ? next(open) : next
    if (!controlled) setInternalOpen(value)
    onOpenChange?.(value)
  }
  const [dock, setDock] = useState<'left' | 'right'>('right')
  const [dragging, setDragging] = useState(false)
  const [overDismiss, setOverDismiss] = useState(false)
  const [mounted, setMounted] = useState(false)
  const overDismissRef = useRef(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const pointerRef = useRef<null | {
    did: boolean
    id: number
    ox: number
    oy: number
    samples: { t: number; x: number; y: number }[]
    startX: number
    startY: number
  }>(null)
  useEffect(() => {
    setMounted(true)
    const saved = storage.get(storageKey)
    const initialY = saved?.y ?? globalThis.innerHeight / 2 - BUBBLE_SIZE / 2
    const initialDock: 'left' | 'right' =
      saved && saved.x + BUBBLE_SIZE / 2 < globalThis.innerWidth / 2 ? 'left' : 'right'
    setDock(initialDock)
    x.set(computeRestingX(initialDock))
    y.set(initialY)
  }, [storage, storageKey, x, y])
  useEffect(() => {
    if (hotkey === false) return
    const shortcut = (e: KeyboardEvent) => {
      if (matchesHotkey(e, hotkey)) {
        e.preventDefault()
        setOpen(p => !p)
      }
    }
    globalThis.addEventListener('keydown', shortcut)
    return () => globalThis.removeEventListener('keydown', shortcut)
  }, [hotkey])
  useEffect(() => {
    if (!open) return
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (target?.closest('[data-levitato-bubble]')) return
      setOpen(false)
    }
    globalThis.addEventListener('keydown', keyHandler)
    globalThis.addEventListener('mousedown', clickHandler)
    return () => {
      globalThis.removeEventListener('keydown', keyHandler)
      globalThis.removeEventListener('mousedown', clickHandler)
    }
  }, [open])
  if (!(mounted && visible)) return null
  const POPOVER_WIDTH = 288
  const POPOVER_GAP = 10
  const popoverTop = Math.max(EDGE_MARGIN, Math.min(globalThis.innerHeight - 280, y.get()))
  const popoverLeft =
    dock === 'right'
      ? Math.max(EDGE_MARGIN, x.get() - POPOVER_WIDTH - POPOVER_GAP)
      : Math.min(globalThis.innerWidth - POPOVER_WIDTH - EDGE_MARGIN, x.get() + BUBBLE_SIZE + POPOVER_GAP)
  const zoneCenter = { x: globalThis.innerWidth / 2, y: globalThis.innerHeight - 70 }
  return (
    <MotionConfig reducedMotion='user'>
      <div
        data-levitato-bubble
        style={{ inset: 0, pointerEvents: 'none', position: 'fixed', zIndex: 60 }}>
        <AnimatePresence>
          {dragging ? (
            <motion.div
              animate={{ opacity: 1, scale: overDismiss ? 1.3 : 1, y: 0 }}
              className={cn(
                'pointer-events-none fixed bottom-10 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full text-white shadow-lg',
                overDismiss ? 'bg-red-600 shadow-[0_0_32px_rgba(239,68,68,0.55)]' : 'bg-red-500/75'
              )}
              exit={{ opacity: 0, y: 60 }}
              initial={{ opacity: 0, y: 60 }}
              transition={SPRING}>
              <CloseIcon />
            </motion.div>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {open && children ? (
            <motion.dialog
              animate={{ opacity: 1, scale: 1, y: 0 }}
              aria-label={title ?? 'Settings'}
              className={cn(
                'flex flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl',
                dock === 'right' ? 'origin-top-right' : 'origin-top-left'
              )}
              exit={{ opacity: 0, scale: 0.94, y: -4 }}
              initial={{ opacity: 0, scale: 0.94, y: -4 }}
              key='popover'
              open
              style={{
                left: popoverLeft,
                maxHeight: 'min(480px, 80vh)',
                pointerEvents: 'auto',
                position: 'fixed',
                top: popoverTop,
                width: POPOVER_WIDTH
              }}
              transition={POPOVER_SPRING}>
              {(title || trailing) ? (
                <div className='flex items-center justify-between border-b border-border px-3 py-2'>
                  <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>{title}</span>
                  <div className='flex items-center gap-1'>
                    {trailing ?? null}
                    <button
                      aria-label='Close'
                      className='rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
                      onClick={() => setOpen(false)}
                      type='button'>
                      <CloseIcon />
                    </button>
                  </div>
                </div>
              ) : null}
              <div className='flex flex-1 flex-col overflow-y-auto'>{children}</div>
            </motion.dialog>
          ) : null}
        </AnimatePresence>
        <motion.button
          animate={{ opacity: 1, scale: dragging ? 1.1 : 1 }}
          aria-expanded={open}
          aria-label={title ?? 'Bubble'}
          className={cn(
            'flex items-center justify-center rounded-full bg-foreground text-background shadow-lg outline-none hover:shadow-xl',
            className
          )}
          initial={{ opacity: 0, scale: 0.6 }}
          onPointerDown={e => {
            if (e.button !== 0 && e.pointerType === 'mouse') return
            e.currentTarget.setPointerCapture(e.pointerId)
            pointerRef.current = {
              did: false,
              id: e.pointerId,
              ox: e.clientX - x.get(),
              oy: e.clientY - y.get(),
              samples: [{ t: performance.now(), x: x.get(), y: y.get() }],
              startX: e.clientX,
              startY: e.clientY
            }
          }}
          onPointerMove={e => {
            const p = pointerRef.current
            if (p?.id !== e.pointerId) return
            const dist2 = (e.clientX - p.startX) ** 2 + (e.clientY - p.startY) ** 2
            if (!p.did && dist2 > 25) {
              p.did = true
              vibrate(8)
              setDragging(true)
              setOpen(false)
            }
            if (!p.did) return
            const minX = -BUBBLE_SIZE / 2
            const maxX = globalThis.innerWidth - BUBBLE_SIZE / 2
            const minY = EDGE_MARGIN / 2
            const maxY = globalThis.innerHeight - BUBBLE_SIZE - EDGE_MARGIN / 2
            let nx = Math.max(minX, Math.min(maxX, e.clientX - p.ox))
            let ny = Math.max(minY, Math.min(maxY, e.clientY - p.oy))
            const bcx = nx + BUBBLE_SIZE / 2
            const bcy = ny + BUBBLE_SIZE / 2
            const zdx = bcx - zoneCenter.x
            const zdy = bcy - zoneCenter.y
            const zdist2 = zdx * zdx + zdy * zdy
            const inside = zdist2 < DISMISS_RADIUS * DISMISS_RADIUS
            if (inside !== overDismissRef.current) {
              overDismissRef.current = inside
              setOverDismiss(inside)
              if (inside) vibrate(15)
            }
            if (inside) {
              const k = MAGNET_STRENGTH * (1 - Math.sqrt(zdist2) / DISMISS_RADIUS)
              nx += (zoneCenter.x - BUBBLE_SIZE / 2 - nx) * k
              ny += (zoneCenter.y - BUBBLE_SIZE / 2 - ny) * k
            }
            x.set(nx)
            y.set(ny)
            p.samples.push({ t: performance.now(), x: nx, y: ny })
            if (p.samples.length > 5) p.samples.shift()
          }}
          onPointerUp={e => {
            const p = pointerRef.current
            if (p?.id !== e.pointerId) return
            pointerRef.current = null
            try {
              e.currentTarget.releasePointerCapture(e.pointerId)
            } catch {}
            if (!p.did) {
              setOpen(prev => !prev)
              return
            }
            setDragging(false)
            const now = performance.now()
            const fallback = p.samples[0] ?? { t: now, x: x.get(), y: y.get() }
            const first = p.samples.find(s => now - s.t < 80) ?? fallback
            const last = p.samples.at(-1) ?? fallback
            const dt = Math.max(1, last.t - first.t)
            const vx = ((last.x - first.x) / dt) * 1000
            const vy = ((last.y - first.y) / dt) * 1000
            const speed = Math.hypot(vx, vy)
            if (overDismissRef.current || speed > FLICK_VELOCITY) {
              vibrate([20, 40, 30])
              overDismissRef.current = false
              setOverDismiss(false)
              return
            }
            overDismissRef.current = false
            setOverDismiss(false)
            const projectedX = x.get() + vx * 0.15
            const nextDock: 'left' | 'right' = projectedX + BUBBLE_SIZE / 2 < globalThis.innerWidth / 2 ? 'left' : 'right'
            const maxY = globalThis.innerHeight - BUBBLE_SIZE - EDGE_MARGIN
            const targetY = Math.max(EDGE_MARGIN, Math.min(maxY, y.get() + vy * 0.05))
            setDock(nextDock)
            animate(x, computeRestingX(nextDock), { ...SPRING, velocity: vx })
            animate(y, targetY, { ...SPRING, velocity: vy })
            storage.set(storageKey, { x: computeRestingX(nextDock), y: targetY })
          }}
          style={{
            cursor: 'pointer',
            height: BUBBLE_SIZE,
            left: 0,
            pointerEvents: 'auto',
            position: 'fixed',
            top: 0,
            touchAction: 'none',
            width: BUBBLE_SIZE,
            x,
            y,
            ...styleProp
          }}
          transition={SPRING}
          type='button'
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}>
          {icon ?? <DefaultIcon />}
        </motion.button>
      </div>
    </MotionConfig>
  )
}
export { Bubble }
export type { BubbleProps }

/* eslint-disable @eslint-react/hooks-extra/no-direct-set-state-in-use-effect */
'use client'
import type { ReactNode } from 'react'
import { animate, AnimatePresence, motion, MotionConfig, useMotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { StorageAdapter } from './storage'
import { cn } from './cn'
import { matchesHotkey } from './hotkey'
import { localStorageAdapter } from './storage'

const BUBBLE_SIZE = 40
const EDGE_MARGIN = 12
const POPOVER_WIDTH = 288
const POPOVER_GAP = 10
const DISMISS_RADIUS = 80
const MAGNET_STRENGTH = 0.35
const SPRING = { damping: 28, mass: 0.8, stiffness: 320, type: 'spring' as const }
const POPOVER_SPRING = { damping: 28, mass: 0.7, stiffness: 380, type: 'spring' as const }
const SUCTION = { damping: 18, mass: 0.6, stiffness: 520, type: 'spring' as const }
const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern)
}
const isMac = typeof navigator !== 'undefined' && /mac/iu.test(navigator.userAgent)
const KEY_SYMBOLS: Record<string, string> = {
  alt: '⌥',
  cmd: '⌘',
  ctrl: 'Ctrl',
  meta: '⌘',
  mod: isMac ? '⌘' : 'Ctrl',
  option: '⌥',
  shift: '⇧'
}
const prettifyHotkey = (spec: string): string =>
  spec
    .split('+')
    .map(p => p.trim())
    .map(p => KEY_SYMBOLS[p.toLowerCase()] ?? (p.length === 1 ? p.toUpperCase() : p))
    .join(' ')
const computeRestingX = (dock: 'left' | 'right') =>
  dock === 'right' ? globalThis.innerWidth - BUBBLE_SIZE - EDGE_MARGIN : EDGE_MARGIN
const DefaultIcon = () => (
  <svg aria-hidden='true' fill='currentColor' height='6' viewBox='0 0 24 6' width='22'>
    <circle cx='4' cy='3' r='2' />
    <circle cx='12' cy='3' r='2' />
    <circle cx='20' cy='3' r='2' />
  </svg>
)
const CloseIcon = ({ className = 'size-3.5' }: { className?: string }) => (
  <svg aria-hidden='true' className={className} fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
    <path d='M6 6l12 12M6 18L18 6' strokeLinecap='round' />
  </svg>
)
interface BubbleProps {
  children?: ReactNode
  className?: string
  dismissible?: boolean
  hotkey?: false | string
  icon?: ReactNode
  onDismiss?: () => void
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
  dismissible = true,
  hotkey = 'mod+.',
  icon,
  onDismiss,
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
  const setOpen = (next: ((p: boolean) => boolean) | boolean) => {
    const value = typeof next === 'function' ? next(open) : next
    if (!controlled) setInternalOpen(value)
    onOpenChange?.(value)
  }
  const [dock, setDock] = useState<'left' | 'right'>('right')
  const [dragging, setDragging] = useState(false)
  const [overDismiss, setOverDismiss] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  const [hidden, setHidden] = useState(false)
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
  const resetPosition = () => {
    const saved = storage.get(storageKey)
    const initialY = saved?.y ?? globalThis.innerHeight / 2 - BUBBLE_SIZE / 2
    const initialDock: 'left' | 'right' = saved && saved.x + BUBBLE_SIZE / 2 < globalThis.innerWidth / 2 ? 'left' : 'right'
    setDock(initialDock)
    x.set(computeRestingX(initialDock))
    y.set(initialY)
  }
  useEffect(() => {
    setMounted(true)
    resetPosition()
  }, [storage, storageKey, x, y])
  useEffect(() => {
    if (hotkey === false) return
    const shortcut = (e: KeyboardEvent) => {
      if (!matchesHotkey(e, hotkey)) return
      e.preventDefault()
      if (hidden) {
        setHidden(false)
        resetPosition()
        return
      }
      setOpen(p => !p)
    }
    globalThis.addEventListener('keydown', shortcut)
    return () => globalThis.removeEventListener('keydown', shortcut)
  }, [hidden, hotkey])
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
  const hotkeyHint = hotkey === false ? null : prettifyHotkey(hotkey)
  if (hidden)
    return (
      <MotionConfig reducedMotion='user'>
        <AnimatePresence>
          <motion.button
            animate={{ opacity: 1, y: 0 }}
            aria-label='Show bubble'
            className='pointer-events-auto fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-popover px-4 py-2 text-xs font-medium text-popover-foreground shadow-lg'
            exit={{ opacity: 0, y: 12 }}
            initial={{ opacity: 0, y: 12 }}
            onClick={() => {
              setHidden(false)
              resetPosition()
            }}
            transition={SPRING}
            type='button'>
            <DefaultIcon />
            <span>Bring back</span>
            {hotkeyHint ? (
              <kbd className='rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]'>{hotkeyHint}</kbd>
            ) : null}
          </motion.button>
        </AnimatePresence>
      </MotionConfig>
    )

  const wantBottom = y.get() + 300 > globalThis.innerHeight
  const popoverLeft =
    dock === 'right'
      ? Math.max(EDGE_MARGIN, x.get() - POPOVER_WIDTH - POPOVER_GAP)
      : Math.min(globalThis.innerWidth - POPOVER_WIDTH - EDGE_MARGIN, x.get() + BUBBLE_SIZE + POPOVER_GAP)
  const popoverVertical = wantBottom
    ? { bottom: Math.max(EDGE_MARGIN, globalThis.innerHeight - y.get() - BUBBLE_SIZE) }
    : { top: Math.max(EDGE_MARGIN, Math.min(globalThis.innerHeight - 280, y.get())) }
  const originClass =
    dock === 'right'
      ? wantBottom
        ? 'origin-bottom-right'
        : 'origin-top-right'
      : wantBottom
        ? 'origin-bottom-left'
        : 'origin-top-left'
  const zoneCenter = { x: globalThis.innerWidth / 2, y: globalThis.innerHeight - 70 }
  const dismiss = () => {
    overDismissRef.current = false
    setOverDismiss(false)
    setDragging(false)
    setOpen(false)
    setDismissing(true)
    vibrate([20, 40, 30])
    animate(x, zoneCenter.x - BUBBLE_SIZE / 2, SUCTION)
    animate(y, zoneCenter.y - BUBBLE_SIZE / 2, SUCTION)
    globalThis.setTimeout(() => {
      setDismissing(false)
      setHidden(true)
      onDismiss?.()
    }, 260)
  }
  const hasHeader = Boolean(title) || Boolean(trailing)
  return (
    <MotionConfig reducedMotion='user'>
      <div className='pointer-events-none fixed inset-0 z-[60]' data-levitato-bubble>
        <AnimatePresence>
          {dragging && dismissible ? (
            <motion.div
              animate={{ opacity: 1, scale: overDismiss ? 1.3 : 1, y: 0 }}
              className={cn(
                'pointer-events-none fixed bottom-10 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full text-white shadow-lg',
                overDismiss ? 'bg-red-600 shadow-[0_0_32px_rgba(239,68,68,0.55)]' : 'bg-red-500/75'
              )}
              exit={{ opacity: 0, y: 60 }}
              initial={{ opacity: 0, y: 60 }}
              transition={SPRING}>
              <CloseIcon className='size-5' />
            </motion.div>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {open && children ? (
            <motion.dialog
              animate={{ opacity: 1, scale: 1, y: 0 }}
              aria-label={title ?? 'Panel'}
              className={cn(
                'pointer-events-auto fixed flex max-h-[min(480px,80vh)] w-72 flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl',
                originClass
              )}
              exit={{ opacity: 0, scale: 0.94, y: -4 }}
              initial={{ opacity: 0, scale: 0.94, y: -4 }}
              key='popover'
              open
              style={{ left: popoverLeft, ...popoverVertical }}
              transition={POPOVER_SPRING}>
              {hasHeader ? (
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
          animate={dismissing ? { opacity: 0, scale: 0 } : { opacity: 1, scale: dragging ? 1.1 : 1 }}
          aria-expanded={open}
          aria-label={title ?? 'Bubble'}
          className={cn(
            'pointer-events-auto fixed top-0 left-0 flex size-10 cursor-pointer touch-none items-center justify-center rounded-full bg-foreground text-background shadow-lg outline-none hover:shadow-xl',
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
            if (dismissible) {
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
            e.currentTarget.releasePointerCapture(e.pointerId)
            if (!p.did) {
              setOpen(prev => !prev)
              return
            }
            if (dismissible && overDismissRef.current) {
              dismiss()
              return
            }
            setDragging(false)
            overDismissRef.current = false
            setOverDismiss(false)
            const now = performance.now()
            const fallback = p.samples[0] ?? { t: now, x: x.get(), y: y.get() }
            const first = p.samples.find(s => now - s.t < 80) ?? fallback
            const last = p.samples.at(-1) ?? fallback
            const dt = Math.max(1, last.t - first.t)
            const vx = ((last.x - first.x) / dt) * 1000
            const vy = ((last.y - first.y) / dt) * 1000
            const projectedX = x.get() + vx * 0.15
            const nextDock: 'left' | 'right' = projectedX + BUBBLE_SIZE / 2 < globalThis.innerWidth / 2 ? 'left' : 'right'
            const maxY = globalThis.innerHeight - BUBBLE_SIZE - EDGE_MARGIN
            const targetY = Math.max(EDGE_MARGIN, Math.min(maxY, y.get() + vy * 0.05))
            setDock(nextDock)
            animate(x, computeRestingX(nextDock), { ...SPRING, velocity: vx })
            animate(y, targetY, { ...SPRING, velocity: vy })
            storage.set(storageKey, { x: computeRestingX(nextDock), y: targetY })
          }}
          style={{ x, y, ...styleProp }}
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

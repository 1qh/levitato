'use client'
import type { DeepPartial, LevitatoConfig } from 'levitato'
import { defaultConfig } from 'levitato'
import { useEffect, useRef } from 'react'
import { Pane } from 'tweakpane'

interface TweakPanelProps {
  onChange: (config: DeepPartial<LevitatoConfig>) => void
}
const TweakPanel = ({ onChange }: TweakPanelProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])
  useEffect(() => {
    const host = ref.current
    if (!host) return
    const state = {
      bubbleSize: defaultConfig.bubbleSize,
      dismissDurationMs: defaultConfig.dismiss.durationMs,
      dismissMagnet: defaultConfig.dismiss.magnet,
      dismissRadius: defaultConfig.dismiss.radius,
      dragThresholdPx: defaultConfig.dragThresholdPx,
      edgeMargin: defaultConfig.edgeMargin,
      popoverDamping: defaultConfig.springs.popover.damping,
      popoverGap: defaultConfig.popover.gap,
      popoverMaxHeightPx: defaultConfig.popover.maxHeightPx,
      popoverStiffness: defaultConfig.springs.popover.stiffness,
      popoverWidth: defaultConfig.popover.width,
      snapDamping: defaultConfig.springs.snap.damping,
      snapStiffness: defaultConfig.springs.snap.stiffness,
      suctionDamping: defaultConfig.springs.suction.damping,
      suctionStiffness: defaultConfig.springs.suction.stiffness
    }
    const initial = { ...state }
    const pane = new Pane({ container: host, title: 'Bubble config' })
    const layout = pane.addFolder({ title: 'Layout' })
    layout.addBinding(state, 'bubbleSize', { label: 'bubble size', max: 96, min: 24, step: 1 })
    layout.addBinding(state, 'edgeMargin', { label: 'edge margin', max: 48, min: 0, step: 1 })
    layout.addBinding(state, 'dragThresholdPx', { label: 'drag start px', max: 20, min: 1, step: 1 })
    const pop = pane.addFolder({ title: 'Popover' })
    pop.addBinding(state, 'popoverWidth', { label: 'width', max: 480, min: 160, step: 1 })
    pop.addBinding(state, 'popoverGap', { label: 'gap', max: 40, min: 0, step: 1 })
    pop.addBinding(state, 'popoverMaxHeightPx', { label: 'max height', max: 800, min: 200, step: 10 })
    const dis = pane.addFolder({ title: 'Dismiss' })
    dis.addBinding(state, 'dismissRadius', { label: 'zone radius', max: 160, min: 30, step: 1 })
    dis.addBinding(state, 'dismissMagnet', { label: 'magnet', max: 1, min: 0, step: 0.01 })
    dis.addBinding(state, 'dismissDurationMs', { label: 'suction ms', max: 800, min: 80, step: 10 })
    const spr = pane.addFolder({ title: 'Springs' })
    spr.addBinding(state, 'snapStiffness', { label: 'snap stiff', max: 800, min: 80, step: 10 })
    spr.addBinding(state, 'snapDamping', { label: 'snap damp', max: 60, min: 5, step: 1 })
    spr.addBinding(state, 'popoverStiffness', { label: 'pop stiff', max: 800, min: 80, step: 10 })
    spr.addBinding(state, 'popoverDamping', { label: 'pop damp', max: 60, min: 5, step: 1 })
    spr.addBinding(state, 'suctionStiffness', { label: 'suck stiff', max: 1000, min: 80, step: 10 })
    spr.addBinding(state, 'suctionDamping', { label: 'suck damp', max: 60, min: 5, step: 1 })
    pane.addButton({ title: 'Reset to defaults' }).on('click', () => {
      Object.assign(state, initial)
      pane.refresh()
    })
    pane.on('change', () => {
      onChangeRef.current({
        bubbleSize: state.bubbleSize,
        dismiss: { durationMs: state.dismissDurationMs, magnet: state.dismissMagnet, radius: state.dismissRadius },
        dragThresholdPx: state.dragThresholdPx,
        edgeMargin: state.edgeMargin,
        popover: { gap: state.popoverGap, maxHeightPx: state.popoverMaxHeightPx, width: state.popoverWidth },
        springs: {
          popover: {
            damping: state.popoverDamping,
            mass: defaultConfig.springs.popover.mass,
            stiffness: state.popoverStiffness
          },
          snap: { damping: state.snapDamping, mass: defaultConfig.springs.snap.mass, stiffness: state.snapStiffness },
          suction: {
            damping: state.suctionDamping,
            mass: defaultConfig.springs.suction.mass,
            stiffness: state.suctionStiffness
          }
        }
      })
    })
    return () => pane.dispose()
  }, [])
  return <div className='[&_.tp-dfwv]:!w-full' ref={ref} />
}
export default TweakPanel

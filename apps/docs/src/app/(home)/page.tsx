'use client'
import type { DeepPartial, LevitatoConfig } from 'levitato'
import { Bubble } from 'levitato'
import Link from 'next/link'
import { useState } from 'react'
import TweakPanel from './tweak-panel'

const Page = () => {
  const [config, setConfig] = useState<DeepPartial<LevitatoConfig>>({})
  const [dismissed, setDismissed] = useState(false)
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden px-4'>
      <h1 className='text-6xl font-extrabold tracking-tighter'>levitato</h1>
      <p className='text-2xl text-muted-foreground'>Floating draggable bubble for React</p>
      <code className='rounded-lg bg-muted px-4 py-2 text-sm'>bun add levitato</code>
      <Link
        className='rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90'
        href='/docs'>
        Get Started
      </Link>
      <p className='text-sm text-muted-foreground'>Open the bubble to tune every constant live.</p>
      {dismissed ? (
        <p className='flex items-center gap-1.5 text-sm text-muted-foreground'>
          Dismissed — press
          <kbd className='rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs'>⌘ .</kbd>
          or
          <button
            className='rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90'
            onClick={() => {
              globalThis.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: '.', metaKey: true }))
            }}
            type='button'>
            bring it back
          </button>
        </p>
      ) : null}
      <Bubble
        config={config}
        onDismiss={() => setDismissed(true)}
        onOpenChange={open => {
          if (open) setDismissed(false)
        }}>
        <TweakPanel onChange={setConfig} />
      </Bubble>
    </div>
  )
}
export default Page

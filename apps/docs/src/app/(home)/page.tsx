'use client'
import type { DeepPartial, LevitatoConfig } from 'levitato'
import { Bubble } from 'levitato'
import Link from 'next/link'
import { useState } from 'react'
import TweakPanel from './tweak-panel'

const Page = () => {
  const [config, setConfig] = useState<DeepPartial<LevitatoConfig>>({})
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden px-4'>
      <h1 className='text-6xl font-extrabold tracking-tighter'>levitato</h1>
      <p className='text-2xl text-fd-muted-foreground'>Floating draggable bubble for React</p>
      <code className='rounded-lg bg-fd-muted px-4 py-2 text-sm'>bun add levitato</code>
      <Link
        className='rounded-full bg-fd-primary px-8 py-3 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90'
        href='/docs'>
        Get Started
      </Link>
      <p className='text-sm text-fd-muted-foreground'>
        Open the bubble · tune every constant live · drop in the red zone to dismiss · press ⌘. to summon back
      </p>
      <Bubble config={config}>
        <TweakPanel onChange={setConfig} />
      </Bubble>
    </div>
  )
}
export default Page

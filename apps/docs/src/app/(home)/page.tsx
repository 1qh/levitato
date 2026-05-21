'use client'
import { Bubble } from 'levitato'
import Link from 'next/link'
import { useState } from 'react'

const Page = () => {
  const [count, setCount] = useState(0)
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
        Drag it · drop in the red zone to dismiss · press ⌘. to toggle or summon back · opened {count}×
      </p>
      <Bubble onOpenChange={open => open && setCount(c => c + 1)} title='Demo'>
        <div className='px-4 py-3 text-sm'>
          <p className='text-fd-muted-foreground'>Any React content here.</p>
          <p className='mt-2'>Snap left or right. Position persists.</p>
        </div>
      </Bubble>
    </div>
  )
}
export default Page

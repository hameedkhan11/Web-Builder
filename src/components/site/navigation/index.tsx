// Navigation.tsx
import { ModeToggle } from '@/components/global/mode-toggle'
import { UserButton } from '@clerk/nextjs'
import { User } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {
  user?: null | User
}

const Navigation = ({ user }: Props) => {
  return (
    <div className='p-4 flex items-center justify-between relative bg-background/80 backdrop-blur-sm z-[100]'>
      <aside className='flex items-center gap-2'>
        <Image
          src="/assets/plura-logo.svg"
          width={40}
          height={40}
          alt="logo"
        />
        <span className='text-xl font-bold'>
          Plura.
        </span>
      </aside>

      <nav className='hidden md:block absolute left-[50%] top-[50%] transform -translate-x-1/2 -translate-y-1/2'>
        <ul className='flex items-center justify-center gap-8'>
          <li>
            <Link href="/pricing" className='font-bold hover:text-primary transition-colors'>
              Pricing
            </Link>
          </li>
          <li>
            <Link href="/absolute" className='hover:text-primary transition-colors font-bold'>
              Absolute
            </Link>
          </li>
          <li>
            <Link href="/documentation" className='hover:text-primary transition-colors font-bold'>
              Documentation
            </Link>
          </li>
          <li>
            <Link href="/features" className='hover:text-primary transition-colors font-bold'>
              Features
            </Link>
          </li>
        </ul>
      </nav>

      <aside className='flex items-center gap-2'>
        <Link 
          href="/agency"
          className='inline-flex items-center justify-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80 transition-colors'
        >
          Login
        </Link>
        <UserButton />
        <ModeToggle />
      </aside>
    </div>
  )
}

export default Navigation
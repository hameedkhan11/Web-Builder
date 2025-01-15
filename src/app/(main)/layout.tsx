import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
const AuthLayout = ({children}:{children:React.ReactNode}) => {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
        <div className='flex h-full items-center justify-center'>{children}</div>
    </ClerkProvider>
  )
}

export default AuthLayout
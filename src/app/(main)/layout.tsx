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
        {children}
    </ClerkProvider>
  )
}

export default AuthLayout
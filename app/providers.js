'use client'

import { AppProvider } from '@/components/AppContext'

export function Providers({ children }) {
  return <AppProvider>{children}</AppProvider>
}

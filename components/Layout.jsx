'use client'

import Sidebar from './Sidebar'
import { AppProvider } from './AppContext'

export default function Layout({ children }) {
  return (
    <AppProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '32px',
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          {children}
        </main>
      </div>
    </AppProvider>
  )
}

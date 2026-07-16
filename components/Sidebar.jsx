'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  HelpCircle,
  Calendar,
  GraduationCap,
  Settings,
} from 'lucide-react'

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/subjects', icon: BookOpen, label: 'Matérias' },
  { path: '/timer', icon: Clock, label: 'Cronômetro' },
  { path: '/questions', icon: HelpCircle, label: 'Questões' },
  { path: '/schedule', icon: Calendar, label: 'Cronograma' },
  { path: '/settings', icon: Settings, label: 'Configurações' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '40px',
          paddingLeft: '12px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GraduationCap size={22} color="#fff" />
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Concursei</h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                fontWeight: 500,
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

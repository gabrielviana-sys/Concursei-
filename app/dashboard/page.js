'use client'

import { useApp } from '@/components/AppContext'
import Layout from '@/components/Layout'
import { formatMinutes } from '@/lib/time'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Clock, BookOpen, HelpCircle, Target } from 'lucide-react'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6']

function StatCard({ icon: Icon, title, value, subtitle, color }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={24} color={color} />
      </div>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>{title}</p>
        <h3 style={{ fontSize: '28px', fontWeight: 700 }}>{value}</h3>
        {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>{subtitle}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { stats, subjects, sessions, loading } = useApp()

  if (loading || !stats) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
        </div>
      </Layout>
    )
  }

  const weeklyData = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const minutes = sessions
      .filter((s) => new Date(s.date).toISOString().split('T')[0] === key)
      .reduce((acc, s) => acc + s.minutes, 0)
    weeklyData.push({
      day: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      minutos: minutes,
    })
  }

  const subjectData = subjects
    .filter((s) => {
      const minutes = sessions.filter((x) => x.subjectId === s.id).reduce((acc, x) => acc + x.minutes, 0)
      return minutes > 0
    })
    .map((s) => {
      const minutes = sessions.filter((x) => x.subjectId === s.id).reduce((acc, x) => acc + x.minutes, 0)
      return { name: s.name, value: minutes, color: s.color }
    })

  const subjectStats = subjects.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    total_minutes: sessions.filter((x) => x.subjectId === s.id).reduce((acc, x) => acc + x.minutes, 0),
    session_count: sessions.filter((x) => x.subjectId === s.id).length,
  }))

  return (
    <Layout>
      <div>
        <header style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Acompanhe sua evolução nos estudos.</p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <StatCard
            icon={Clock}
            title="Tempo total de estudo"
            value={formatMinutes(stats.totalMinutes)}
            subtitle={`${sessions.length} sessões`}
            color="#6366f1"
          />
          <StatCard icon={BookOpen} title="Matérias cadastradas" value={stats.subjectsCount} color="#22c55e" />
          <StatCard
            icon={HelpCircle}
            title="Questões respondidas"
            value={stats.totalQuestions}
            subtitle={`${stats.correctQuestions} acertos / ${stats.totalQuestions - stats.correctQuestions} erros`}
            color="#f59e0b"
          />
          <StatCard icon={Target} title="Taxa de acerto" value={`${stats.accuracy}%`} color="#ec4899" />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Tempo de estudo (últimos 7 dias)</h3>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="minutos" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Distribuição por matéria</h3>
            <div style={{ height: '280px' }}>
              {subjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => formatMinutes(value)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Nenhum dado ainda
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '24px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Ranking de matérias</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {subjectStats.map((s) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: s.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontWeight: 500 }}>{s.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{formatMinutes(s.total_minutes)}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{s.session_count} sessões</span>
              </div>
            ))}
            {subjectStats.length === 0 && (
              <p style={{ color: 'var(--text-secondary)' }}>Nenhuma matéria cadastrada.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

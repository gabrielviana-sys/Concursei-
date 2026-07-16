'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/components/AppContext'
import Layout from '@/components/Layout'
import TopicPanel from '@/components/TopicPanel'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, CheckCircle2, Circle, Clock, BookOpen, NotebookPen } from 'lucide-react'

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function toDateKey(date) {
  const d = typeof date === 'string' && date.length === 10 ? new Date(`${date}T12:00:00`) : new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCalendarDays(year, month) {
  const firstDayOfMonth = new Date(year, month, 1)
  const startDay = firstDayOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day))
  return days
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function SchedulePage() {
  const { subjects, topics, toggleTopicCompleted, loading } = useApp()
  const safeTopics = useMemo(() => (Array.isArray(topics) ? topics : []), [topics])
  const [view, setView] = useState('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const topicsByDate = useMemo(() => {
    const map = new Map()
    for (const topic of safeTopics) {
      if (!topic.studyDate) continue
      const key = toDateKey(topic.studyDate)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(topic)
    }
    for (const list of map.values()) list.sort((a, b) => a.name.localeCompare(b.name))
    return map
  }, [safeTopics])

  const allScheduleDates = useMemo(() => {
    const keys = Array.from(topicsByDate.keys()).sort()
    return keys.map((k) => new Date(`${k}T12:00:00`))
  }, [topicsByDate])

  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month])
  const today = new Date()

  if (loading || !Array.isArray(safeTopics)) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Carregando cronograma...</p>
        </div>
      </Layout>
    )
  }

  const goToToday = () => {
    const now = new Date()
    setCurrentDate(now)
    setSelectedDate(now)
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getSubject = (subjectId) => subjects.find((s) => s.id === subjectId)

  const renderTopicCard = (topic, compact = false) => {
    const subject = getSubject(topic.subjectId)
    const color = subject?.color || 'var(--accent)'

    return (
      <div
        key={topic.id}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          padding: compact ? '6px 8px' : '10px 12px',
          marginBottom: '6px',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          borderLeft: `3px solid ${color}`,
          borderRadius: '6px',
          fontSize: compact ? '11px' : '13px',
        }}
      >
        <button
          onClick={() => toggleTopicCompleted(topic.id, !topic.completed)}
          style={{
            backgroundColor: 'transparent',
            color: topic.completed ? 'var(--success)' : 'var(--text-secondary)',
            padding: 0,
            marginTop: '1px',
            flexShrink: 0,
          }}
        >
          {topic.completed ? <CheckCircle2 size={compact ? 14 : 16} /> : <Circle size={compact ? 14 : 16} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            onClick={() => setSelectedTopic(topic)}
            style={{
              margin: 0,
              lineHeight: 1.35,
              textDecoration: topic.completed ? 'line-through' : 'none',
              color: topic.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: compact ? 'nowrap' : 'normal',
              cursor: 'pointer',
            }}
          >
            {topic.name}
          </p>
          {!compact && subject && <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>{subject.name}</p>}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setSelectedTopic(topic)
          }}
          title="Abrir painel do conteúdo"
          style={{
            padding: '4px',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            flexShrink: 0,
            marginLeft: '4px',
          }}
        >
          <NotebookPen size={compact ? 14 : 16} />
        </button>
      </div>
    )
  }

  const renderDayCell = (date) => {
    if (!date) {
      return (
        <div
          key="empty"
          style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', opacity: 0.4, minHeight: '120px' }}
        />
      )
    }

    const dateKey = toDateKey(date)
    const dayTopics = topicsByDate.get(dateKey) || []
    const isToday = isSameDay(date, today)
    const isSelected = selectedDate && isSameDay(date, selectedDate)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6

    return (
      <div
        key={dateKey}
        onClick={() => setSelectedDate(date)}
        style={{
          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-secondary)',
          border: isToday ? '1px solid var(--accent)' : '1px solid var(--border)',
          borderRadius: '10px',
          padding: '10px',
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          opacity: isWeekend && dayTopics.length === 0 ? 0.85 : 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: isToday ? 'var(--accent)' : 'transparent',
              color: isToday ? '#fff' : 'var(--text-primary)',
            }}
          >
            {date.getDate()}
          </span>
          {dayTopics.length > 0 && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-tertiary)',
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              {dayTopics.length}
            </span>
          )}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {dayTopics.slice(0, 3).map((topic) => renderTopicCard(topic, true))}
          {dayTopics.length > 3 && (
            <p style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px' }}>+{dayTopics.length - 3} conteúdos</p>
          )}
        </div>
      </div>
    )
  }

  const selectedDayKey = selectedDate ? toDateKey(selectedDate) : null
  const selectedDayTopics = selectedDayKey ? topicsByDate.get(selectedDayKey) || [] : []

  if (loading || !safeTopics) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Carregando cronograma...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        <header
          style={{
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Cronograma</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Visualize seus conteúdos organizados dia a dia.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '6px',
              }}
            >
              <button
                onClick={prevMonth}
                disabled={view === 'list'}
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  color: view === 'list' ? 'var(--text-secondary)' : 'var(--text-primary)',
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <span style={{ minWidth: '150px', textAlign: 'center', fontWeight: 600, fontSize: '15px' }}>
                {view === 'month' ? `${MONTH_NAMES[month]} de ${year}` : 'Todos os dias'}
              </span>
              <button
                onClick={nextMonth}
                disabled={view === 'list'}
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  color: view === 'list' ? 'var(--text-secondary)' : 'var(--text-primary)',
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {view === 'month' && (
              <button
                onClick={goToToday}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                }}
              >
                Hoje
              </button>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '4px',
              }}
            >
              <button
                onClick={() => setView('month')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  backgroundColor: view === 'month' ? 'var(--accent)' : 'transparent',
                  color: view === 'month' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 500,
                }}
              >
                <CalendarIcon size={16} />
                Mês
              </button>
              <button
                onClick={() => setView('list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  backgroundColor: view === 'list' ? 'var(--accent)' : 'transparent',
                  color: view === 'list' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 500,
                }}
              >
                <List size={16} />
                Lista
              </button>
            </div>
          </div>
        </header>

        {view === 'month' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '10px' }}>
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  style={{
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    padding: '8px',
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
              {calendarDays.map((date) => renderDayCell(date))}
            </div>

            {selectedDate && (
              <div
                style={{
                  marginTop: '24px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '24px',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}
                >
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
                    {selectedDate.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <button
                    onClick={() => setSelectedDate(null)}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '8px',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                    }}
                  >
                    Fechar
                  </button>
                </div>

                {selectedDayTopics.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                    <BookOpen size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <p>Nenhum conteúdo programado para este dia.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                    {selectedDayTopics.map((topic) => renderTopicCard(topic))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {view === 'list' && allScheduleDates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <CalendarIcon size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Nenhum conteúdo com data definida.</p>
          </div>
        )}

        {view === 'list' &&
          allScheduleDates.map((date) => {
            const dateKey = toDateKey(date)
            const dayTopics = topicsByDate.get(dateKey) || []
            const isTodayDate = isSameDay(date, today)

            return (
              <div
                key={dateKey}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: isTodayDate ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: isTodayDate ? 'var(--accent)' : 'var(--bg-tertiary)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.9 }}>{WEEK_DAYS[date.getDay()]}</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1 }}>{date.getDate()}</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
                      {date.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {dayTopics.filter((t) => t.completed).length} de {dayTopics.length} concluídos
                    </p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {dayTopics.map((topic) => renderTopicCard(topic))}
                </div>
              </div>
            )
          })}

        {safeTopics.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
            }}
          >
            <CalendarIcon size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Nenhum conteúdo cadastrado.</p>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>Vá até a página Matérias para criar conteúdos.</p>
          </div>
        )}

        {selectedTopic && (
          <TopicPanel
            topic={selectedTopic}
            subject={getSubject(selectedTopic.subjectId)}
            onClose={() => setSelectedTopic(null)}
          />
        )}
      </div>
    </Layout>
  )
}

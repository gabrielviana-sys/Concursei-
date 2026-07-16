'use client'

import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/components/AppContext'
import Layout from '@/components/Layout'
import { formatSeconds } from '@/lib/time'
import { Play, Pause, RotateCcw, CheckCircle, Coffee, Clock, Trash2 } from 'lucide-react'

const POMODORO_WORK = 25 * 60
const POMODORO_SHORT_BREAK = 5 * 60
const POMODORO_LONG_BREAK = 15 * 60

export default function TimerPage() {
  const { subjects, addSession, sessions, deleteSession, loading } = useApp()
  const [mode, setMode] = useState('timer')
  const [seconds, setSeconds] = useState(0)
  const [targetSeconds, setTargetSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [subjectId, setSubjectId] = useState('')
  const [sessionType, setSessionType] = useState('timer')
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (mode === 'pomodoro' && prev >= 1) {
            return prev - 1
          }
          return prev + 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, mode])

  useEffect(() => {
    if (mode === 'pomodoro' && seconds === 0 && isRunning && targetSeconds > 0) {
      clearInterval(intervalRef.current)
      setIsRunning(false)
      if (sessionType === 'timer') {
        finishSession()
      }
    }
  }, [seconds, isRunning, mode, targetSeconds, sessionType])

  const startPomodoro = (duration, type) => {
    setMode('pomodoro')
    setSeconds(duration)
    setTargetSeconds(duration)
    setSessionType(type)
    setIsRunning(true)
  }

  const toggleTimer = () => {
    if (mode === 'pomodoro') {
      setIsRunning(!isRunning)
      return
    }
    if (seconds === 0) {
      setMode('timer')
      setSessionType('timer')
    }
    setIsRunning(!isRunning)
  }

  const reset = () => {
    setIsRunning(false)
    setSeconds(0)
    setTargetSeconds(0)
    setMode('timer')
    setSessionType('timer')
  }

  const finishSession = async () => {
    const minutes = Math.ceil(seconds / 60)
    if (minutes > 0 && subjectId) {
      await addSession({
        subjectId,
        minutes,
        sessionType,
        date: new Date().toISOString(),
      })
    }
    reset()
  }

  const getSubjectName = (id) => {
    const s = subjects.find((x) => x.id === id)
    return s ? s.name : 'Matéria removida'
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        <header style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Cronômetro</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Controle seu tempo de estudo com timer ou pomodoro.</p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '420px',
            }}
          >
            <div style={{ marginBottom: '32px', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  reset()
                  setMode('timer')
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: mode === 'timer' ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: '#fff',
                  fontWeight: 600,
                }}
              >
                <Clock size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Timer
              </button>
              <button
                onClick={() => {
                  reset()
                  setMode('pomodoro')
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: mode === 'pomodoro' ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: '#fff',
                  fontWeight: 600,
                }}
              >
                <Coffee size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Pomodoro
              </button>
            </div>

            {mode === 'pomodoro' && !isRunning && seconds === 0 && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  onClick={() => startPomodoro(POMODORO_WORK, 'timer')}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--success)',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                >
                  Foco (25 min)
                </button>
                <button
                  onClick={() => startPomodoro(POMODORO_SHORT_BREAK, 'break')}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--warning)',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                >
                  Pausa curta (5 min)
                </button>
                <button
                  onClick={() => startPomodoro(POMODORO_LONG_BREAK, 'break')}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#a855f7',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                >
                  Pausa longa (15 min)
                </button>
              </div>
            )}

            <div
              style={{
                fontSize: '96px',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                marginBottom: '40px',
                color: mode === 'pomodoro' && sessionType === 'break' ? 'var(--warning)' : 'var(--text-primary)',
              }}
            >
              {formatSeconds(seconds)}
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <button
                onClick={toggleTimer}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isRunning ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '4px' }} />}
              </button>
              <button
                onClick={reset}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RotateCcw size={24} />
              </button>
              <button
                onClick={finishSession}
                disabled={!subjectId || seconds === 0}
                style={{
                  height: '64px',
                  padding: '0 28px',
                  borderRadius: '32px',
                  backgroundColor: !subjectId || seconds === 0 ? 'var(--bg-tertiary)' : 'var(--success)',
                  color: '#fff',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: !subjectId || seconds === 0 ? 0.5 : 1,
                }}
              >
                <CheckCircle size={22} />
                Salvar sessão
              </button>
            </div>

            <div style={{ width: '100%', maxWidth: '360px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                Matéria
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Selecione uma matéria</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              maxHeight: '600px',
              overflow: 'auto',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Últimas sessões</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sessions.slice(0, 20).map((session) => (
                <div
                  key={session.id}
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600 }}>{getSubjectName(session.subjectId)}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {new Date(session.date).toLocaleDateString('pt-BR')} • {session.sessionType === 'break' ? 'Pausa' : 'Estudo'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 700 }}>{session.minutes} min</span>
                    <button
                      onClick={() => deleteSession(session.id)}
                      style={{
                        padding: '6px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '6px',
                        color: 'var(--danger)',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                  Nenhuma sessão registrada ainda.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

'use client'

import { useState } from 'react'
import { useApp } from '@/components/AppContext'
import Layout from '@/components/Layout'
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react'

export default function QuestionsPage() {
  const { subjects, questions, addQuestion, updateQuestion, deleteQuestion, loading } = useApp()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    subjectId: '',
    topic: '',
    total: 0,
    correct: 0,
    wrong: 0,
    date: new Date().toISOString().split('T')[0],
  })

  const resetForm = () => {
    setForm({
      subjectId: '',
      topic: '',
      total: 0,
      correct: 0,
      wrong: 0,
      date: new Date().toISOString().split('T')[0],
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.subjectId || form.total <= 0) return
    if (editingId) {
      await updateQuestion({ ...form, id: editingId })
    } else {
      await addQuestion(form)
    }
    resetForm()
  }

  const startEdit = (q) => {
    setEditingId(q.id)
    setForm({
      subjectId: q.subjectId,
      topic: q.topic,
      total: q.total,
      correct: q.correct,
      wrong: q.wrong,
      date: new Date(q.date).toISOString().split('T')[0],
    })
    setIsAdding(true)
  }

  const getSubjectName = (id) => {
    const s = subjects.find((x) => x.id === id)
    return s ? s.name : 'Matéria removida'
  }

  const getAccuracy = (correct, total) => (total > 0 ? Math.round((correct / total) * 100) : 0)

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
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Questões</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Controle as questões que você resolve por matéria.</p>
          </div>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: 'var(--accent)',
                color: '#fff',
                borderRadius: '10px',
                fontWeight: 600,
              }}
            >
              <Plus size={18} />
              Registrar questões
            </button>
          )}
        </header>

        {isAdding && (
          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
              {editingId ? 'Editar registro' : 'Registrar questões'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Matéria
                </label>
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">Selecione</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Data
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Assunto / Tópico
                </label>
                <input
                  type="text"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="Ex: Direitos Fundamentais"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Total de questões
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.total}
                  onChange={(e) => setForm({ ...form, total: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Acertos
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.correct}
                  onChange={(e) => setForm({ ...form, correct: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: 'var(--success)',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 600,
                }}
              >
                <Save size={18} />
                Salvar
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  fontWeight: 600,
                }}
              >
                <X size={18} />
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questions.map((q) => {
            const accuracy = getAccuracy(q.correct, q.total)
            return (
              <div
                key={q.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        backgroundColor: 'var(--bg-tertiary)',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {getSubjectName(q.subjectId)}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {new Date(q.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 600 }}>{q.topic || 'Sem tópico'}</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total</p>
                    <p style={{ fontSize: '20px', fontWeight: 700 }}>{q.total}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Acertos</p>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>{q.correct}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Erros</p>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--danger)' }}>{q.wrong}</p>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '60px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>%</p>
                    <p
                      style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: accuracy >= 70 ? 'var(--success)' : accuracy >= 50 ? 'var(--warning)' : 'var(--danger)',
                      }}
                    >
                      {accuracy}%
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => startEdit(q)}
                      style={{
                        padding: '8px',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      style={{
                        padding: '8px',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        color: 'var(--danger)',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {questions.length === 0 && !isAdding && (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--text-secondary)',
              }}
            >
              <p>Nenhuma questão registrada ainda.</p>
              <p style={{ marginTop: '8px' }}>Clique em "Registrar questões" para começar.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

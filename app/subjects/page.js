'use client'

import { useState } from 'react'
import { useApp } from '@/components/AppContext'
import Layout from '@/components/Layout'
import TopicPanel from '@/components/TopicPanel'
import { Plus, Trash2, Edit2, Save, X, CheckCircle2, Circle, NotebookPen } from 'lucide-react'

const PRESET_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6']

export default function SubjectsPage() {
  const { subjects, topics, addSubject, updateSubject, deleteSubject, deleteTopic, toggleTopicCompleted, loading } = useApp()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [form, setForm] = useState({ name: '', color: '#6366f1', goalMinutes: 60 })

  const resetForm = () => {
    setForm({ name: '', color: '#6366f1', goalMinutes: 60 })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editingId) {
      await updateSubject({ ...form, id: editingId })
    } else {
      await addSubject(form)
    }
    resetForm()
  }

  const startEdit = (subject) => {
    setEditingId(subject.id)
    setForm({
      name: subject.name,
      color: subject.color,
      goalMinutes: subject.goalMinutes,
    })
    setIsAdding(true)
  }

  const getSubjectTopics = (subjectId) => topics.filter((t) => t.subjectId === subjectId)

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
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Matérias</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Cadastre matérias e visualize seus conteúdos.</p>
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
              Nova matéria
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
              {editingId ? 'Editar matéria' : 'Nova matéria'}
            </h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Nome da matéria
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Direito Constitucional"
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
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Cor
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, color: c })}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: c,
                          border: form.color === c ? '3px solid #fff' : '3px solid transparent',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ width: '160px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Meta (min/dia)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.goalMinutes}
                    onChange={(e) => setForm({ ...form, goalMinutes: Number(e.target.value) })}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {subjects.map((subject) => {
            const subjectTopics = getSubjectTopics(subject.id)
            const isSelected = selectedSubject === subject.id
            return (
              <div
                key={subject.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{ padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}
                  onClick={() => setSelectedSubject(isSelected ? null : subject.id)}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: subject.color,
                      flexShrink: 0,
                      marginTop: '4px',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{subject.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      Meta: {subject.goalMinutes} min/dia • {subjectTopics.length} conteúdos
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => startEdit(subject)}
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
                      onClick={() => deleteSubject(subject.id)}
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

                {isSelected && (
                  <div
                    style={{
                      borderTop: '1px solid var(--border)',
                      padding: '16px',
                      maxHeight: '300px',
                      overflow: 'auto',
                    }}
                  >
                    {subjectTopics.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Nenhum conteúdo cadastrado.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {subjectTopics.map((topic) => (
                          <div
                            key={topic.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px',
                              backgroundColor: 'var(--bg-tertiary)',
                              borderRadius: '8px',
                            }}
                          >
                            <button
                              onClick={() => toggleTopicCompleted(topic.id, !topic.completed)}
                              style={{
                                backgroundColor: 'transparent',
                                color: topic.completed ? 'var(--success)' : 'var(--text-secondary)',
                              }}
                            >
                              {topic.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </button>
                            <div style={{ flex: 1 }}>
                              <p
                                style={{
                                  fontSize: '13px',
                                  textDecoration: topic.completed ? 'line-through' : 'none',
                                  color: topic.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                                }}
                              >
                                {topic.name}
                              </p>
                              {topic.studyDate && (
                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                  {new Date(topic.studyDate).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => deleteTopic(topic.id)}
                              style={{ backgroundColor: 'transparent', color: 'var(--danger)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {subjects.length === 0 && !isAdding && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-secondary)',
            }}
          >
            <p>Nenhuma matéria cadastrada ainda.</p>
            <p style={{ marginTop: '8px' }}>Clique em &ldquo;Nova matéria&rdquo; para começar.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

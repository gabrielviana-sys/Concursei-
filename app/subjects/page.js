'use client'

import { useState, useRef } from 'react'
import { useApp } from '@/components/AppContext'
import Layout from '@/components/Layout'
import TopicPanel from '@/components/TopicPanel'
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Upload,
  CheckCircle2,
  Circle,
  FileSpreadsheet,
  FileX,
  NotebookPen,
} from 'lucide-react'

const currentDate = new Date()
const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
const currentYear = String(currentDate.getFullYear())

const PRESET_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6']

export default function SubjectsPage() {
  const {
    subjects,
    topics,
    addSubject,
    updateSubject,
    deleteSubject,
    deleteTopic,
    toggleTopicCompleted,
    importScheduleExcel,
    clearSchedule,
    loading,
    refreshAll,
  } = useApp()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [form, setForm] = useState({ name: '', color: '#6366f1', goalMinutes: 60 })

  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [showExcelModal, setShowExcelModal] = useState(false)
  const [excelMonth, setExcelMonth] = useState(currentMonth)
  const [excelYear, setExcelYear] = useState(currentYear)
  const [excelFile, setExcelFile] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showPdfInfo, setShowPdfInfo] = useState(false)
  const pdfInputRef = useRef(null)
  const excelInputRef = useRef(null)

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

  const scheduleTopics = topics.filter((t) => t.source === 'gran-cursos' || t.source === 'gran-excel')

  const exportToCsv = () => {
    const rows = [['Matéria', 'Data', 'Conteúdo', 'Concluído']]
    for (const topic of topics) {
      const subject = subjects.find((s) => s.id === topic.subjectId)
      const date = topic.studyDate ? new Date(topic.studyDate).toLocaleDateString('pt-BR') : ''
      rows.push([subject ? subject.name : '', date, topic.name, topic.completed ? 'Sim' : 'Não'])
    }
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cronograma-concursei.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportExcel = async () => {
    if (!excelFile) return
    setShowExcelModal(false)
    setImporting(true)
    setImportResult(null)
    try {
      const formData = new FormData()
      formData.append('file', excelFile)
      formData.append('month', excelMonth)
      formData.append('year', excelYear)
      const result = await importScheduleExcel(formData)
      setImportResult(result)
    } catch (err) {
      setImportResult({ error: err.message })
    } finally {
      setImporting(false)
      setExcelFile(null)
      if (excelInputRef.current) excelInputRef.current.value = ''
    }
  }

  const handleImportPdf = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/import/schedule/pdf', { method: 'POST', body: formData })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erro na importação')
      await refreshAll()
      setImportResult(result)
    } catch (err) {
      setImportResult({ error: err.message })
    } finally {
      setImporting(false)
      if (pdfInputRef.current) pdfInputRef.current.value = ''
    }
  }

  const handleClearSchedule = async () => {
    await clearSchedule()
    setShowClearConfirm(false)
  }

  const openExcelModal = () => {
    setExcelFile(null)
    setImportResult(null)
    setShowExcelModal(true)
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
            <p style={{ color: 'var(--text-secondary)' }}>Cadastre matérias e importe seu cronograma do Gran Cursos.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button
              onClick={openExcelModal}
              disabled={importing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: '#10b981',
                color: '#fff',
                borderRadius: '10px',
                fontWeight: 600,
                opacity: importing ? 0.7 : 1,
              }}
            >
              <FileSpreadsheet size={18} />
              Importar Excel
            </button>
            <button
              onClick={() => setShowPdfInfo(true)}
              disabled={importing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: 'var(--warning)',
                color: '#fff',
                borderRadius: '10px',
                fontWeight: 600,
                opacity: importing ? 0.7 : 1,
              }}
            >
              <Upload size={18} />
              Importar PDF
            </button>
            <button
              onClick={exportToCsv}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                borderRadius: '10px',
                fontWeight: 600,
              }}
            >
              <FileSpreadsheet size={18} />
              Exportar CSV
            </button>
            {scheduleTopics.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: 'var(--danger)',
                  color: '#fff',
                  borderRadius: '10px',
                  fontWeight: 600,
                }}
              >
                <FileX size={18} />
                Limpar cronograma
              </button>
            )}
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
          </div>
        </header>

        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={handleImportPdf}
        />

        <input
          ref={excelInputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
        />

        {(importing || importResult) && (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '20px',
              marginBottom: '24px',
            }}
          >
            {importing && (
              <div>
                <p style={{ marginBottom: '12px' }}>Importando cronograma...</p>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: '60%',
                      height: '100%',
                      backgroundColor: 'var(--accent)',
                      transition: 'width 0.3s',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                </div>
              </div>
            )}
            {importResult && !importResult.error && (
              <div>
                <p style={{ color: 'var(--success)', fontWeight: 600, marginBottom: '4px' }}>Importação concluída!</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {importResult.totalPages ? `${importResult.totalPages} páginas lidas • ` : ''}
                  {importResult.totalItems} aulas encontradas • {importResult.createdSubjects} matérias novas •{' '}
                  {importResult.createdTopics} conteúdos salvos
                </p>
              </div>
            )}
            {importResult?.error && <p style={{ color: 'var(--danger)' }}>Erro na importação: {importResult.error}</p>}
          </div>
        )}

        {showExcelModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowExcelModal(false)}
          >
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '28px',
                width: '100%',
                maxWidth: '420px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Importar Excel</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                Selecione o arquivo e informe o mês e ano do cronograma.
              </p>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Arquivo .xlsx ou .xls
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                {excelFile && (
                  <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{excelFile.name}</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Mês
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={excelMonth}
                    onChange={(e) => setExcelMonth(e.target.value)}
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
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Ano
                  </label>
                  <input
                    type="number"
                    min="2000"
                    value={excelYear}
                    onChange={(e) => setExcelYear(e.target.value)}
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
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleImportExcel}
                  disabled={!excelFile}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    backgroundColor: 'var(--success)',
                    color: '#fff',
                    borderRadius: '8px',
                    fontWeight: 600,
                    opacity: !excelFile ? 0.6 : 1,
                  }}
                >
                  Importar
                </button>
                <button
                  onClick={() => setShowExcelModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {showClearConfirm && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowClearConfirm(false)}
          >
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '28px',
                width: '100%',
                maxWidth: '420px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Limpar cronograma</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                Isso vai remover todos os conteúdos importados do PDF/Excel. As matérias e os dados de estudo não serão
                apagados.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleClearSchedule}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    backgroundColor: 'var(--danger)',
                    color: '#fff',
                    borderRadius: '8px',
                    fontWeight: 600,
                  }}
                >
                  Limpar
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {showPdfInfo && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowPdfInfo(false)}
          >
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '28px',
                width: '100%',
                maxWidth: '480px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Importar PDF</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                O importador de PDF funciona com arquivos que já tenham texto selecionável. PDFs escaneados ou em imagem
                (como a maioria dos cronogramas do Gran Cursos) precisam ser convertidos para Excel antes.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowPdfInfo(false)
                    pdfInputRef.current?.click()
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    backgroundColor: 'var(--warning)',
                    color: '#fff',
                    borderRadius: '8px',
                    fontWeight: 600,
                  }}
                >
                  Selecionar PDF
                </button>
                <button
                  onClick={() => setShowPdfInfo(false)}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

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
                              onClick={() => setSelectedTopic(topic)}
                              title="Abrir painel do conteúdo"
                              style={{ backgroundColor: 'transparent', color: 'var(--accent)' }}
                            >
                              <NotebookPen size={14} />
                            </button>
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
            <p style={{ marginTop: '8px' }}>Clique em &ldquo;Nova matéria&rdquo; ou &ldquo;Importar Excel/PDF&rdquo; para começar.</p>
          </div>
        )}

        {selectedTopic && (
          <TopicPanel
            topic={selectedTopic}
            subject={subjects.find((s) => s.id === selectedTopic.subjectId)}
            onClose={() => setSelectedTopic(null)}
          />
        )}
      </div>
    </Layout>
  )
}

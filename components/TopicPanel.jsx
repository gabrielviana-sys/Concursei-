'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from './AppContext'
import { X, FileText, Sparkles, Trash2, Save, Loader2, Upload } from 'lucide-react'

export default function TopicPanel({ topic, subject, onClose }) {
  const router = useRouter()
  const { getTopicAttachments, addTopicAttachment, updateTopicAttachment, deleteTopicAttachment, summarizeAttachment } = useApp()
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [noteId, setNoteId] = useState(null)
  const [savingNote, setSavingNote] = useState(false)
  const [summarizingId, setSummarizingId] = useState(null)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const pdfInputRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      const data = await getTopicAttachments(topic.id)
      setAttachments(data)
      const noteAttachment = data.find((a) => a.type === 'note')
      if (noteAttachment) {
        setNote(noteAttachment.content || '')
        setNoteId(noteAttachment.id)
      }
      setLoading(false)
    }
    load()
  }, [topic.id, getTopicAttachments])

  const handleSaveNote = async () => {
    setSavingNote(true)
    if (noteId) {
      await updateTopicAttachment(noteId, { content: note })
    } else {
      const created = await addTopicAttachment({
        topicId: topic.id,
        type: 'note',
        title: 'Anotações',
        content: note,
      })
      setNoteId(created.id)
      setAttachments((prev) => [...prev, created])
    }
    setSavingNote(false)
  }

  const handleSummarize = async (attachment) => {
    setSummarizingId(attachment.id)
    try {
      const { summary } = await summarizeAttachment(attachment.id)
      const created = await addTopicAttachment({
        topicId: topic.id,
        type: 'summary',
        title: `Resumo: ${attachment.title}`,
        content: summary,
      })
      setAttachments((prev) => [...prev, created])
    } catch (err) {
      alert(err.message || 'Erro ao gerar resumo')
    }
    setSummarizingId(null)
  }

  const handleAddTextAttachment = async () => {
    const text = window.prompt('Cole o texto do PDF aqui:')
    if (!text) return
    const title = window.prompt('Título do documento:') || 'Documento'
    const created = await addTopicAttachment({
      topicId: topic.id,
      type: 'pdf',
      title,
      content: text,
    })
    setAttachments((prev) => [...prev, created])
  }

  const handleUploadPdf = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPdf(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('topicId', topic.id)
      const res = await fetch('/api/attachments/pdf', { method: 'POST', body: formData })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erro ao enviar PDF')
      setAttachments((prev) => [...prev, result])
    } catch (err) {
      alert(err.message || 'Erro ao enviar PDF')
    } finally {
      setUploadingPdf(false)
      if (pdfInputRef.current) pdfInputRef.current.value = ''
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '60vw',
        maxWidth: '720px',
        backgroundColor: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{topic.name}</h3>
          {subject && <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{subject.name}</p>}
        </div>
        <button onClick={onClose} style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
        ) : (
          <>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Anotações</h4>
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: 'var(--accent)',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  <Save size={14} />
                  {savingNote ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Escreva suas anotações sobre este conteúdo..."
                style={{
                  width: '100%',
                  minHeight: '140px',
                  padding: '14px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  resize: 'vertical',
                  lineHeight: 1.6,
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Documentos e resumos</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={handleUploadPdf}
                  />
                  <button
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={uploadingPdf}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      backgroundColor: 'var(--accent)',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      opacity: uploadingPdf ? 0.7 : 1,
                    }}
                  >
                    <Upload size={14} />
                    {uploadingPdf ? 'Enviando...' : 'Adicionar PDF'}
                  </button>
                  <button
                    onClick={handleAddTextAttachment}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    <FileText size={14} />
                    Adicionar texto
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {attachments
                  .filter((a) => a.type !== 'note')
                  .map((attachment) => (
                    <div
                      key={attachment.id}
                      style={{
                        padding: '14px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <FileText size={18} color="var(--accent)" />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '14px' }}>{attachment.title}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {attachment.type === 'summary' ? 'Resumo gerado por IA' : attachment.fileUrl ? 'PDF anexado' : 'Texto do documento'}
                        </p>
                      </div>
                      {attachment.type === 'pdf' && (
                        <>
                          {attachment.fileUrl && (
                            <a
                              href={attachment.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: '8px 14px',
                                backgroundColor: 'var(--bg-tertiary)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              Abrir PDF
                            </a>
                          )}
                          <button
                            onClick={() => handleSummarize(attachment)}
                            disabled={summarizingId === attachment.id || !attachment.content}
                            style={{
                              padding: '8px',
                              backgroundColor: 'var(--bg-tertiary)',
                              borderRadius: '8px',
                              color: !attachment.content ? 'var(--text-secondary)' : 'var(--accent)',
                            }}
                            title={attachment.content ? 'Gerar resumo com IA' : 'PDF sem texto selecionável'}
                          >
                            {summarizingId === attachment.id ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                          </button>
                        </>
                      )}
                      {attachment.type === 'summary' && (
                        <button
                          onClick={() => router.push(`/summary/${attachment.id}`)}
                          style={{
                            padding: '8px 14px',
                            backgroundColor: 'var(--accent)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                        >
                          Ver resumo
                        </button>
                      )}
                      <button
                        onClick={() => deleteTopicAttachment(attachment.id)}
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
                  ))}
                {attachments.filter((a) => a.type !== 'note').length === 0 && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Nenhum documento ou resumo ainda.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { ArrowLeft, Copy, FileText } from 'lucide-react'

export default function SummaryPage() {
  const { id } = useParams()
  const router = useRouter()
  const [attachment, setAttachment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/attachments/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAttachment(data)
        setLoading(false)
      })
  }, [id])

  const handleCopy = () => {
    if (!attachment?.content) return
    navigator.clipboard.writeText(attachment.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Layout>
      <div>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
            color: 'var(--text-secondary)',
            backgroundColor: 'transparent',
          }}
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
        ) : !attachment ? (
          <p style={{ color: 'var(--text-secondary)' }}>Resumo não encontrado.</p>
        ) : (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '32px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={28} color="var(--accent)" />
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{attachment.title}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {new Date(attachment.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  fontWeight: 600,
                }}
              >
                <Copy size={16} />
                {copied ? 'Copiado!' : 'Copiar resumo'}
              </button>
            </div>

            <div
              style={{
                lineHeight: 1.7,
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {attachment.content}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
